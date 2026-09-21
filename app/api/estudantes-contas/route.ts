import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase-env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { eSuperAdmin } from "@/lib/gestao-auth";
import { randomBytes } from "crypto";
import { enviarUmEmail, htmlContaEstudante, siteUrl } from "@/lib/email";
import { cursoDocenciaPorSlug } from "@/lib/docencia";

export const dynamic = "force-dynamic";

/** Password inicial aleatória — nunca derivada do número de estudante (é visível em qualquer pauta). */
function gerarPasswordAleatoria(): string {
  return randomBytes(18).toString("base64url");
}

async function pedirSuperAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* rota só de leitura de sessão */
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  return eSuperAdmin(data.user);
}

export async function GET(request: Request) {
  if (!(await pedirSuperAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const regimeFilter = searchParams.get("regime") || "todos";
  const cursoFilter = searchParams.get("curso") || "todos";
  const anoFilter = searchParams.get("ano") || "todos";
  const search = (searchParams.get("q") || "").trim().toLowerCase();
  // "activo" (omisso) = só a turma activa, tal como pedido — Trancados e
  // Desistentes ficam de fora sem desaparecerem (o registo em Situação dos
  // estudantes mantém-se, e "todos" ainda os mostra aqui se for preciso).
  const matriculaFilter = searchParams.get("matricula") || "activo";

  // 1. Obter todos os estudantes inscritos nas turmas
  let query = admin.from("turma_estudantes").select("*").order("nome", { ascending: true });
  if (regimeFilter !== "todos") {
    query = query.eq("regime", regimeFilter);
  }
  if (cursoFilter !== "todos") {
    query = query.eq("curso", cursoFilter);
  }
  if (anoFilter !== "todos") {
    query = query.eq("ano", Number(anoFilter));
  }

  const { data: turmaData, error: turmaErr } = await query;
  if (turmaErr) {
    return NextResponse.json({ error: turmaErr.message }, { status: 400 });
  }

  // 2. Obter todas as contas de auth registadas
  const { data: authData, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 400 });
  }

  const authUsersMap = new Map<string, { id: string; email: string }>();
  for (const u of authData.users || []) {
    const num = u.user_metadata?.numero_estudante || u.user_metadata?.numeroEstudante;
    if (num) {
      authUsersMap.set(String(num).trim().toUpperCase(), { id: u.id, email: u.email || "" });
    }
  }

  // 2b. Estado de matrícula (Activo/Trancado/Desistiu) — sem registo em
  // situacao_estudante conta como Activo (é o normal antes de haver
  // qualquer trancamento/desistência a registar).
  const matriculaMap = new Map<string, string>();
  const { data: situacaoData } = await admin
    .from("situacao_estudante")
    .select("numero_estudante, matricula_estado");
  for (const s of situacaoData || []) {
    if (s.numero_estudante) matriculaMap.set(String(s.numero_estudante).trim().toUpperCase(), s.matricula_estado);
  }

  // 3. Cruzar dados
  const listaCompleta = (turmaData || []).map((t) => {
    const numUpper = String(t.numero_estudante).trim().toUpperCase();
    const conta = authUsersMap.get(numUpper);
    const emailGerado = `${numUpper.toLowerCase()}@gmail.com`;

    return {
      id: t.id,
      numeroEstudante: t.numero_estudante,
      nome: t.nome,
      curso: t.curso,
      regime: t.regime,
      ano: t.ano,
      temConta: Boolean(conta),
      userId: conta?.id || null,
      email: conta?.email || emailGerado,
      matriculaEstado: matriculaMap.get(numUpper) || "activo",
    };
  });

  // Filtrar por estado de matrícula, depois por texto de pesquisa
  const porMatricula =
    matriculaFilter === "todos"
      ? listaCompleta
      : listaCompleta.filter((e) => e.matriculaEstado === matriculaFilter);
  const filtrados = search
    ? porMatricula.filter(
        (e) =>
          e.nome.toLowerCase().includes(search) ||
          e.numeroEstudante.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search)
      )
    : porMatricula;

  return NextResponse.json({ estudantes: filtrados, total: filtrados.length });
}

export async function POST(request: Request) {
  if (!(await pedirSuperAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const action = body?.action || "sincronizar";

  if (action === "criar_unico") {
    const numeroEstudante = String(body?.numeroEstudante || "").trim();
    const nome = String(body?.nome || "").trim();
    const curso = String(body?.curso || "jornalismo");
    const regime = String(body?.regime || "diurno");
    const ano = Number(body?.ano) || 1;
    const emailInput = String(body?.email || "").trim();
    // Preenchido quando a conta nasce de uma candidatura admitida (ver
    // Candidaturas → "Criar conta") — liga a turma à candidatura de origem,
    // para nunca duplicar a conta do mesmo candidato.
    const candidaturaProtocolo = String(body?.candidaturaProtocolo || "").trim() || null;

    if (!numeroEstudante || !nome) {
      return NextResponse.json({ error: "Número e nome do estudante são obrigatórios." }, { status: 400 });
    }
    // O e-mail tem de ser real e fornecido por si — nunca inventado a partir
    // do número de estudante (não é um endereço que o estudante controle).
    if (!emailInput || !emailInput.includes("@")) {
      return NextResponse.json(
        { error: "Indique o e-mail real do estudante — não é possível inventar um." },
        { status: 400 }
      );
    }

    const passwordTemporaria = gerarPasswordAleatoria();

    // Registar na tabela turma_estudantes se ainda não existir
    const turmaUpsert: Record<string, unknown> = {
      numero_estudante: numeroEstudante,
      nome,
      curso,
      regime,
      ano,
    };
    if (candidaturaProtocolo) turmaUpsert.candidatura_protocolo = candidaturaProtocolo;
    const { error: turmaUpsertErr } = await admin
      .from("turma_estudantes")
      .upsert(turmaUpsert, { onConflict: "numero_estudante,curso" });
    // Se a coluna candidatura_protocolo ainda não existir (migração por
    // correr), tenta outra vez sem ela em vez de falhar a criação da conta.
    if (turmaUpsertErr && candidaturaProtocolo) {
      delete turmaUpsert.candidatura_protocolo;
      await admin.from("turma_estudantes").upsert(turmaUpsert, { onConflict: "numero_estudante,curso" });
    }

    const { data: userCreated, error: createErr } = await admin.auth.admin.createUser({
      email: emailInput,
      password: passwordTemporaria,
      email_confirm: true,
      user_metadata: {
        role: "estudante",
        full_name: nome,
        numero_estudante: numeroEstudante,
        curso,
      },
    });

    if (createErr && !/already.*registered|already.*exists/i.test(createErr.message)) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    // Em vez de mostrar a senha num cartão no painel, envia-se por e-mail
    // directamente ao candidato (o mesmo e-mail da candidatura), junto com
    // os dados bancários para a matrícula. Só se devolve a senha nesta
    // resposta (para a secretaria comunicar à mão) se o envio falhar — o
    // painel nunca a mostra quando o e-mail foi enviado com sucesso.
    let emailEnviado = false;
    let avisoEmail: string | null = null;
    if (userCreated?.user) {
      try {
        const regimeEmail = regime === "pos-laboral" ? "pos-laboral" : "diurno";
        await enviarUmEmail(
          emailInput,
          "Candidatura admitida — dados de acesso e matrícula",
          htmlContaEstudante({
            origem: siteUrl(request),
            nome,
            numeroEstudante,
            curso: cursoDocenciaPorSlug(curso)?.titulo || curso,
            email: emailInput,
            passwordTemporaria,
            regime: regimeEmail,
          })
        );
        emailEnviado = true;
      } catch (err) {
        avisoEmail = err instanceof Error ? err.message : "Não foi possível enviar o e-mail.";
      }
    }

    return NextResponse.json({
      ok: true,
      userId: userCreated?.user?.id || null,
      emailEnviado,
      avisoEmail,
      passwordTemporaria: userCreated?.user && !emailEnviado ? passwordTemporaria : null,
    });
  }

  return NextResponse.json(
    {
      error:
        "A criação em lote de contas foi desativada — gerava a mesma password previsível para todos os estudantes. Peça a cada estudante para se registar em /entrar (fica automaticamente ligado à turma), ou crie contas uma a uma indicando o e-mail real de cada estudante.",
    },
    { status: 400 }
  );
}

export async function PUT(request: Request) {
  if (!(await pedirSuperAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const numeroEstudante = String(body?.numeroEstudante || "").trim();
  const nome = String(body?.nome || "").trim();
  const curso = String(body?.curso || "");
  const regime = String(body?.regime || "");
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "").trim();

  if (!numeroEstudante || !nome) {
    return NextResponse.json({ error: "Número e nome do estudante são obrigatórios." }, { status: 400 });
  }

  // 1. Atualizar na tabela turma_estudantes
  const { error: turmaErr } = await admin
    .from("turma_estudantes")
    .update({ nome, curso, regime })
    .eq("numero_estudante", numeroEstudante);

  if (turmaErr) {
    return NextResponse.json({ error: turmaErr.message }, { status: 400 });
  }

  // 2. Atualizar no Auth se existir utilizador
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUser = (authData?.users || []).find(
    (u) =>
      u.user_metadata?.numero_estudante === numeroEstudante ||
      u.user_metadata?.numeroEstudante === numeroEstudante
  );

  let aviso: string | null = null;

  if (authUser) {
    const updatePayload: {
      user_metadata: Record<string, unknown>;
      email?: string;
      email_confirm?: boolean;
      password?: string;
    } = {
      user_metadata: {
        ...authUser.user_metadata,
        full_name: nome,
        curso,
      },
    };
    if (email && email.includes("@")) {
      updatePayload.email = email;
      // Sem isto, o Supabase pode deixar o e-mail antigo activo à espera que
      // o estudante confirme o novo por link — o admin vê "gravado" mas nada
      // muda. Uma correcção feita pela secretaria deve aplicar-se já.
      updatePayload.email_confirm = true;
    }
    if (password && password.length >= 6) {
      updatePayload.password = password;
    }
    const { error: updateErr } = await admin.auth.admin.updateUserById(authUser.id, updatePayload);
    if (updateErr) {
      return NextResponse.json(
        { error: `O estudante foi actualizado na turma, mas a conta de acesso falhou: ${updateErr.message}` },
        { status: 400 }
      );
    }
  } else if (email && email.includes("@")) {
    aviso =
      "Este estudante ainda não tem conta de acesso registada — o e-mail só ficará activo quando ele se registar em /entrar.";
  }

  return NextResponse.json({ ok: true, aviso });
}

export async function DELETE(request: Request) {
  if (!(await pedirSuperAdmin())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Chave de serviço do Supabase não configurada no servidor." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const numeros: string[] = Array.isArray(body?.numerosEstudantes)
    ? body.numerosEstudantes
    : body?.numeroEstudante
    ? [String(body.numeroEstudante)]
    : [];

  if (numeros.length === 0) {
    return NextResponse.json({ error: "Especifique os números de estudante a eliminar." }, { status: 400 });
  }

  // 1. Eliminar da tabela turma_estudantes
  await admin.from("turma_estudantes").delete().in("numero_estudante", numeros);

  // 2. Eliminar do Supabase Auth
  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsersToDelete = (authData?.users || []).filter((u) => {
    const num = u.user_metadata?.numero_estudante || u.user_metadata?.numeroEstudante;
    return num && numeros.includes(String(num));
  });

  for (const u of authUsersToDelete) {
    await admin.auth.admin.deleteUser(u.id);
  }

  return NextResponse.json({ ok: true, eliminados: numeros.length });
}
