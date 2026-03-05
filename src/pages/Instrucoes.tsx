import React from 'react'
import { useAppContext } from '../AppContext'

const TRIMESTRES = [
  { codigo: 'Q1', meses: 'Março · Abril · Maio' },
  { codigo: 'Q2', meses: 'Junho · Julho · Agosto' },
  { codigo: 'Q3', meses: 'Setembro · Outubro · Novembro' },
]

const MODULOS = [
  {
    titulo: 'Dashboard',
    descricao: 'Visão trimestral com cards de resumo, ranking e indicadores de performance.',
  },
  {
    titulo: 'Ranking Trimestre',
    descricao: 'Ranking detalhado por professor com breakdown mensal por acordeon.',
  },
  {
    titulo: 'Resultado Anual',
    descricao: 'Consolida Q1+Q2+Q3 e gera o ranking final do professor do ano.',
  },
  {
    titulo: 'Lançamento Mensal',
    descricao: 'Entrada de retenção, conversão, média/turma, nota 360, qtd. alunos e observações.',
  },
  {
    titulo: 'PDI Trimestral',
    descricao: 'Lançamento de nota contextual de PDI por professor, uma vez por trimestre.',
  },
  {
    titulo: 'Cadastro Professores',
    descricao: 'Cadastro/edição de professores com vínculo em múltiplas unidades e foto.',
  },
  {
    titulo: 'Configurações',
    descricao: 'Gestão de KPIs, pesos, benchmarks e recálculo manual do ranking trimestral.',
  },
]

export const Instrucoes: React.FC = () => {
  const { anoLetivo, curQ, curUnit } = useAppContext()

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12 space-y-3.5">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Guia de Uso
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          📋 <em className="text-[var(--gold)] not-italic">Instruções completas</em>
        </div>
        <p className="text-xs text-[var(--txt3)] mt-1.5">
          Referência oficial do fluxo operacional no ano letivo {anoLetivo ?? new Date().getFullYear()}.
        </p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">🧭 Navegação do sistema</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {MODULOS.map((modulo) => (
            <div key={modulo.titulo} className="rounded-lg border border-[var(--border)] bg-[rgba(45,90,160,0.08)] p-3">
              <div className="text-[13px] font-bold text-[var(--txt)]">{modulo.titulo}</div>
              <div className="text-xs text-[var(--txt2)] mt-1.5 leading-[1.55]">{modulo.descricao}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">📅 Estrutura do ano</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3.5">
          {TRIMESTRES.map((item) => (
            <div key={item.codigo} className="bg-[rgba(45,90,160,0.12)] border border-[rgba(45,90,160,0.2)] rounded-lg p-3.5 text-center">
              <div className="text-[11px] font-bold text-[var(--ink3)] tracking-[1px] uppercase mb-1.5">{item.codigo}</div>
              <div className="text-[13px] text-[var(--txt)] font-semibold">{item.meses}</div>
            </div>
          ))}
        </div>
        <div className="px-3.5 py-3 bg-[rgba(200,151,58,0.08)] border border-[rgba(200,151,58,0.18)] rounded-lg text-xs text-[var(--txt2)] leading-[1.7]">
          Janeiro, Fevereiro e Dezembro ficam fora do ciclo de avaliação trimestral.
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">✅ Fluxo recomendado (passo a passo)</div>
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--border)] p-3">
            <div className="text-[13px] font-bold text-[var(--txt)]">1) Selecione contexto no topo</div>
            <div className="text-xs text-[var(--txt2)] mt-1.5 leading-[1.6]">
              Defina <strong>trimestre</strong> no seletor Q1/Q2/Q3 e <strong>unidade</strong> na barra de unidades (CG, RC, BA ou Consolidado).
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-3">
            <div className="text-[13px] font-bold text-[var(--txt)]">2) Lance dados mensais</div>
            <div className="text-xs text-[var(--txt2)] mt-1.5 leading-[1.6]">
              Em <strong>Lançamento Mensal</strong>, preencha os campos por professor e clique em <strong>Salvar</strong> (ou <strong>Recalcular tudo</strong>, que usa o mesmo fluxo de persistência e recálculo).
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-3">
            <div className="text-[13px] font-bold text-[var(--txt)]">3) Lance o PDI do trimestre</div>
            <div className="text-xs text-[var(--txt2)] mt-1.5 leading-[1.6]">
              Em <strong>PDI Trimestral</strong>, selecione o trimestre do PDI e salve as notas 0–100 por professor.
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-3">
            <div className="text-[13px] font-bold text-[var(--txt)]">4) Ajuste KPIs e benchmarks quando necessário</div>
            <div className="text-xs text-[var(--txt2)] mt-1.5 leading-[1.6]">
              Em <strong>Configurações</strong>, mantenha a soma dos pesos dos KPIs ativos que entram no Health Score em <strong>100%</strong> e valide min/max de média por turma.
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] p-3">
            <div className="text-[13px] font-bold text-[var(--txt)]">5) Recalcule ranking após mudanças estruturais</div>
            <div className="text-xs text-[var(--txt2)] mt-1.5 leading-[1.6]">
              Após alterar definição/peso de KPI, use o botão <strong>Recalcular ranking {curQ}</strong> para forçar atualização imediata do trimestre selecionado.
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">🧠 Regras de cálculo e leitura dos resultados</div>
        <ul className="space-y-2 text-xs text-[var(--txt2)] leading-[1.65] list-disc pl-4">
          <li>O Health Score é calculado a partir dos KPIs <strong>ativos</strong> e marcados para entrar no Health Score.</li>
          <li>Os pesos ativos devem totalizar 100% para manter consistência da nota final.</li>
          <li>
            <strong>Prof. 360</strong> funciona como corte comportamental (status apto/inapto) e não compõe o percentual do Health Score.
          </li>
          <li>
            <strong>Ranking Trimestre</strong> mostra o resultado do Q selecionado e traz detalhe mensal no acordeon “Ver meses do trimestre”.
          </li>
          <li>
            <strong>Resultado Anual</strong> consolida Q1, Q2 e Q3 para eleger o professor do ano.
          </li>
        </ul>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">🧩 Recursos implementados recentemente</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-[var(--border)] bg-[rgba(26,110,66,0.08)] p-3 text-xs text-[var(--txt2)] leading-[1.6]">
            <strong className="text-[var(--txt)]">KPIs dinâmicos no Config</strong>
            <div className="mt-1">Criação, edição, exclusão, ativação e reordenação de KPIs sem hardcode.</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[rgba(45,90,160,0.08)] p-3 text-xs text-[var(--txt2)] leading-[1.6]">
            <strong className="text-[var(--txt)]">Recálculo explícito do ranking</strong>
            <div className="mt-1">Botão dedicado para recalcular o trimestre atual após ajustes de regra.</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[rgba(184,92,0,0.08)] p-3 text-xs text-[var(--txt2)] leading-[1.6]">
            <strong className="text-[var(--txt)]">Cadastro de professores com foto</strong>
            <div className="mt-1">Suporte a upload/recorte de imagem e vínculo do professor em uma ou mais unidades.</div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[rgba(200,151,58,0.08)] p-3 text-xs text-[var(--txt2)] leading-[1.6]">
            <strong className="text-[var(--txt)]">UX de operação aprimorada</strong>
            <div className="mt-1">Feedbacks de salvamento, validações de formulário e cache atualizado automaticamente.</div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">⚠️ Regras de uso importantes</div>
        <div className="space-y-2 text-xs text-[var(--txt2)] leading-[1.65]">
          <p>
            • Em <strong>Lançamento Mensal</strong> e <strong>PDI Trimestral</strong>, o modo <strong>Consolidado</strong> ({curUnit}) é somente leitura: selecione uma unidade específica para lançar dados.
          </p>
          <p>• Se houver erro de carga/salvamento, verifique conexão e variáveis de ambiente do Supabase.</p>
          <p>• Após grandes mudanças de configuração, confira Dashboard, Ranking e Resultado Anual para validar consistência.</p>
        </div>
      </div>
    </div>
  )
}
