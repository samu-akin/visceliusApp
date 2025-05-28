import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
Home,
Users,
PlusCircle,
LogOut,
ChevronRight,
Music,
AlertTriangle,
CheckCircle,
Mail,
Phone,
Clock,
User,
Settings,
HelpCircle,
Calendar,
MessageCircle,
BarChart,
Edit,
KeyRound
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

// Tipos e Interfaces
interface Paciente {
id: string;
nome: string;
foto?: string;
status: 'ativo' | 'inativo' | 'em tratamento';
email: string;
telefone: string;
condicao: string; // CondiĂ§ĂŁo que necessita de musicoterapia
progresso: string;
avaliacao?: string;
}

interface Medico {
id: string;
nome: string;
crm: string;
email: string;
telefone: string;
especialidade: string;
foto?: string;
horariosAtendimento: string;
}

interface Sessao {
id: string;
pacienteId: string;
data: Date;
duracao: number; // em minutos
tipoTerapia: string;
anotacoes: string;
}

// Dados Mock (substitua por dados reais do seu backend)
const medicoMock: Medico = {
id: 'medico1',
nome: 'Dra. Maria Oliveira',
crm: '123456-SP',
email: 'maria.oliveira@email.com',
telefone: '(11) 99999-8888',
especialidade: 'Musicoterapia NeurolĂłgica',
foto: 'https://source.unsplash.com/random/100x100/?woman&1',
horariosAtendimento: 'Seg a Sex, 09:00 - 18:00',
};

const pacientesMock: Paciente[] = [
{
id: '1', nome: 'JoĂŁo Silva', status: 'ativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&1',
email: 'joao.silva@email.com', telefone: '(11) 98888-7777', condicao: 'RecuperaĂ§ĂŁo de AVC', progresso: 'Melhora na fala e coordenaĂ§ĂŁo.', avaliacao: 'Paciente motivado e colaborativo.'
},
{
id: '2', nome: 'Maria Souza', status: 'em tratamento', foto: 'https://source.unsplash.com/random/50x50/?portrait&2',
email: 'maria.souza@email.com', telefone: '(21) 97777-6666', condicao: 'Autismo', progresso: 'Aumento da interaĂ§ĂŁo social.', avaliacao: 'Paciente responde bem Ă  terapia com instrumentos.'
},
{
id: '3', nome: 'Carlos Pereira', status: 'inativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&3',
email: 'carlos.pereira@email.com', telefone: '(15) 96666-5555', condicao: 'Parkinson', progresso: 'SessĂľes focadas na coordenaĂ§ĂŁo motora.', avaliacao: 'Paciente apresenta progressos lentos, mas constantes.'
},
{
id: '4', nome: 'Ana Rodrigues', status: 'ativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&4',
email: 'ana.rodrigues@email.com', telefone: '(19) 95555-4444', condicao: 'DepressĂŁo', progresso: 'Melhora no humor e expressĂŁo emocional.', avaliacao: 'Paciente engajada nas atividades musicais.'
},
{
id: '5', nome: 'Pedro Martins', status: 'em tratamento', foto: 'https://source.unsplash.com/random/50x50/?portrait&5',
email: 'pedro.martins@email.com', telefone: '(27) 94444-3333', condicao: 'Alzheimer', progresso: 'SessĂľes para estimular a memĂłria.', avaliacao: 'Paciente responde bem a mĂşsicas conhecidas.'
},
{
id: '6', nome: 'Julia Santos', status: 'ativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&6',
email: 'julia.santos@email.com', telefone: '(31) 93333-2222', condicao: 'TDAH', progresso: 'Aumento da concentraĂ§ĂŁo e foco.', avaliacao: 'Paciente demonstra interesse em aprender instrumentos.'
},
{
id: '7', nome: 'Lucas Oliveira', status: 'inativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&7',
email: 'lucas.oliveira@email.com', telefone: '(41) 92222-1111', condicao: 'ReabilitaĂ§ĂŁo pĂłs-cirĂşrgica', progresso: 'SessĂľes para recuperaĂ§ĂŁo motora.', avaliacao: 'Paciente dedicado e otimista.'
},
];

const sessoesMock: Sessao[] = [
{ id: 'sessao1', pacienteId: '1', data: new Date(Date.now() + 86400000), duracao: 60, tipoTerapia: 'Receptiva', anotacoes: 'Foco na escuta musical para relaxamento.' }, // AmanhĂŁ
{ id: 'sessao2', pacienteId: '2', data: new Date(Date.now() + (86400000 * 3)), duracao: 45, tipoTerapia: 'Ativa', anotacoes: 'Uso de instrumentos para expressĂŁo emocional.' }, // Em 3 dias
{ id: 'sessao3', pacienteId: '1', data: new Date(Date.now() - 86400000), duracao: 60, tipoTerapia: 'Receptiva', anotacoes: 'Paciente relatou melhora no humor.' }, // Ontem
{ id: 'sessao4', pacienteId: '3', data: new Date(Date.now() + (86400000 * 7)), duracao: 50, tipoTerapia: 'ImprovisaĂ§ĂŁo', anotacoes: 'SessĂŁo para estimular a criatividade.' }, // Em 7 dias
{ id: 'sessao5', pacienteId: '4', data: new Date(), duracao: 60, tipoTerapia: 'Receptiva', anotacoes: 'SessĂŁo inicial de avaliaĂ§ĂŁo.' },
];

// Componente para exibir o status do paciente
const StatusBadge = ({ status }: { status: Paciente['status'] }) => {
switch (status) {
case 'ativo':
return <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>;
case 'inativo':
return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inativo</Badge>;
case 'em tratamento':
return <Badge variant="warning" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Em Tratamento</Badge>;
default:
return <Badge>Desconhecido</Badge>;
}
};

// Componente para exibir um item da lista de pacientes
const PacienteItem = ({ paciente, onSelectPaciente }: { paciente: Paciente; onSelectPaciente: (id: string) => void }) => (
<motion.div
layout
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 20 }}
className={cn(
"flex items-center justify-between p-4 rounded-lg transition-all duration-200",
"bg-white/5 hover:bg-white/10",
"border border-white/10",
"cursor-pointer"
)}
onClick={() => onSelectPaciente(paciente.id)}
>
<div className="flex items-center gap-4">
<Avatar>
<AvatarImage src={paciente.foto} alt={paciente.nome} />
<AvatarFallback>{paciente.nome.substring(0, 2)}</AvatarFallback>
</Avatar>
<div>
<h3 className="text-lg font-semibold text-white">{paciente.nome}</h3>
<StatusBadge status={paciente.status} />
</div>
</div>
<ChevronRight className="w-5 h-5 text-gray-400" />
</motion.div>
);

// Componente para exibir detalhes do paciente
const DetalhesPaciente = ({ paciente, onVoltar, onAgendarSessao, sessoes }: { paciente: Paciente; onVoltar: () => void; onAgendarSessao: (pacienteId: string) => void; sessoes: Sessao[] }) => {
const pacienteSessoes = sessoes.filter(sessao => sessao.pacienteId === paciente.id);

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
className="flex flex-col h-full"
>
<div className="flex items-center gap-4 p-4 border-b border-white/10">
<Button variant="ghost" onClick={onVoltar} className="text-gray-400 hover:text-white">
<ChevronRight className="w-6 h-6 rotate-180" />
</Button>
<h2 className="text-2xl font-semibold text-white">Detalhes do Paciente</h2>
</div>
<div className="flex-1 p-4 overflow-y-auto">
<Card className="bg-white/5 border border-white/10 shadow-lg mb-6">
<CardHeader>
<div className="flex items-center gap-4">
<Avatar className="w-16 h-16">
<AvatarImage src={paciente.foto} alt={paciente.nome} />
<AvatarFallback>{paciente.nome.substring(0, 2)}</AvatarFallback>
</Avatar>
<div>
<CardTitle className="text-2xl text-white">{paciente.nome}</CardTitle>
<StatusBadge status={paciente.status} />
</div>
</div>
</CardHeader>
<CardContent className="space-y-4">
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">InformaĂ§Ăľes de Contato:</h3>
<div className="flex items-center gap-2">
<Mail className="w-4 h-4 text-gray-400" />
<p className="text-white">{paciente.email}</p>
</div>
<div className="flex items-center gap-2">
<Phone className="w-4 h-4 text-gray-400" />
<p className="text-white">{paciente.telefone}</p>
</div>
</div>
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">CondiĂ§ĂŁo:</h3>
<p className="text-white">{paciente.condicao}</p>
</div>
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">Progresso:</h3>
<p className="text-white">{paciente.progresso}</p>
</div>
{paciente.avaliacao && (
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">AvaliaĂ§ĂŁo:</h3>
<p className="text-white">{paciente.avaliacao}</p>
</div>
)}
<Button
onClick={() => onAgendarSessao(paciente.id)}
className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 border-purple-500/30 mt-4"
>
<Calendar className="w-4 h-4 mr-2" />
Agendar SessĂŁo
</Button>
</CardContent>
</Card>

<Card className="bg-white/5 border border-white/10 shadow-lg">
<CardHeader>
<CardTitle className="text-xl text-white">SessĂľes Agendadas</CardTitle>
</CardHeader>
<CardContent>
{pacienteSessoes.length === 0 ? (
<p className="text-gray-400">Nenhuma sessĂŁo agendada para este paciente.</p>
) : (
<div className="space-y-3">
{pacienteSessoes.map((sessao) => (
<div key={sessao.id} className="p-3 rounded-lg bg-black/20 text-white border border-white/10">
<div className="flex items-center justify-between">
<div>
<p><span className="font-semibold">Data:</span> {format(sessao.data, 'dd/MM/yyyy', { locale: ptBR })}</p>
<p><span className="font-semibold">Hora:</span> {format(sessao.data, 'HH:mm')}</p>
<p><span className="font-semibold">DuraĂ§ĂŁo:</span> {sessao.duracao} minutos</p>
<p><span className="font-semibold">Tipo:</span> {sessao.tipoTerapia}</p>
</div>
<Button
size="sm"
className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 border-purple-500/30"
>
Ver Detalhes
</Button>
</div>
<div className="mt-2">
<span className="font-semibold">AnotaĂ§Ăľes:</span>
<p className="text-gray-300">{sessao.anotacoes}</p>
</div>
</div>
))}
</div>
)}
</CardContent>
</Card>
</div>
</motion.div>
);
};

// Componente para Agendar SessĂŁo
const AgendarSessaoScreen = ({ pacienteId, onVoltar, onSessaoAgendada }: { pacienteId: string; onVoltar: () => void; onSessaoAgendada: (sessao: Sessao) => void }) => {
const [data, setData] = useState<Date | undefined>(new Date());
const [hora, setHora] = useState('');
const [duracao, setDuracao] = useState<number | string>('');
const [tipoTerapia, setTipoTerapia] = useState('');
const [anotacoes, setAnotacoes] = useState('');
const [agendando, setAgendando] = useState(false);
const paciente = pacientesMock.find(p => p.id === pacienteId);

const handleAgendar = async () => {
if (!data || !hora || !duracao || !tipoTerapia) {
alert('Por favor, preencha todos os campos.'); // Usar um componente de alerta melhor
return;
}

setAgendando(true);
// Simular chamada Ă  API
await new Promise(resolve => setTimeout(resolve, 1000));

const dataHora = new Date(data);
const [horaStr, minutoStr] = hora.split(':');
dataHora.setHours(parseInt(horaStr, 10));
dataHora.setMinutes(parseInt(minutoStr, 10));

const novaSessao: Sessao = {
id: `sessao-${Date.now()}`, // Gerar um ID Ăşnico
pacienteId,
data: dataHora,
duracao: typeof duracao === 'string' ? parseInt(duracao, 10) : duracao,
tipoTerapia,
anotacoes,
};

onSessaoAgendada(novaSessao);
setAgendando(false);
onVoltar(); // Voltar para a tela de detalhes do paciente
};

if (!paciente) {
return (
<div className="flex items-center justify-center h-full">
<p className="text-red-500">Paciente nĂŁo encontrado.</p>
</div>
);
}

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
className="flex flex-col h-full p-4"
>
<div className="flex items-center gap-4 mb-6">
<Button variant="ghost" onClick={onVoltar} className="text-gray-400 hover:text-white">
<ChevronRight className="w-6 h-6 rotate-180" />
</Button>
<h2 className="text-2xl font-semibold text-white">Agendar SessĂŁo</h2>
</div>

<Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
<CardHeader>
<CardTitle className="text-xl text-white">Agendar SessĂŁo para {paciente.nome}</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<div className="space-y-2">
<Label htmlFor="data" className="text-white">Data</Label>
<Popover>
<PopoverTrigger asChild>
<Button
variant={"outline"}
className={cn(
"w-full justify-start text-left font-normal bg-black/20 text-white border-purple-500/30",
!data && "text-gray-400"
)}
>
{data ? format(data, "PPP", { locale: ptBR }) : <span>Escolha a data</span>}
</Button>
</PopoverTrigger>
<PopoverContent className="w-auto p-0 bg-white/5 border border-white/10" align="start">
<CalendarUI
mode="single"
selected={data}
onSelect={setData}
className="rounded-md"
locale={ptBR}
style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
/>
</PopoverContent>
</Popover>
</div>

<div className="space-y-2">
<Label htmlFor="hora" className="text-white">Hora</Label>
<Input
id="hora"
type="time"
value={hora}
onChange={(e) => setHora(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="HH:MM"
/>
</div>

<div className="space-y-2">
<Label htmlFor="duracao" className="text-white">DuraĂ§ĂŁo (minutos)</Label>
<Input
id="duracao"
type="number"
value={duracao}
onChange={(e) => setDuracao(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="Ex: 60"
/>
</div>

<div className="space-y-2">
<Label htmlFor="tipoTerapia" className="text-white">Tipo de Terapia</Label>
<Input
id="tipoTerapia"
type="text"
value={tipoTerapia}
onChange={(e) => setTipoTerapia(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="Ex: Receptiva, Ativa"
/>
</div>

<div className="space-y-2">
<Label htmlFor="anotacoes" className="text-white">AnotaĂ§Ăľes</Label>
<Textarea
id="anotacoes"
value={anotacoes}
onChange={(e) => setAnotacoes(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="AnotaĂ§Ăľes sobre a sessĂŁo..."
rows={4}
/>
</div>

<Button
onClick={handleAgendar}
className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border-green-500/30 mt-4"
disabled={agendando}
>
{agendando ? 'Agendando...' : 'Agendar SessĂŁo'}
</Button>
</CardContent>
</Card>
</motion.div>
);
};

// Componente para Perfil do MĂŠdico
const PerfilMedicoScreen = ({ medico, onVoltar, onEditarPerfil }: { medico: Medico; onVoltar: () => void, onEditarPerfil: (medico: Medico) => void }) => {
const [editMode, setEditMode] = useState(false);
const [nome, setNome] = useState(medico.nome);
const [email, setEmail] = useState(medico.email);
const [telefone, setTelefone] = useState(medico.telefone);
const [especialidade, setEspecialidade] = useState(medico.especialidade);
const [horariosAtendimento, setHorariosAtendimento] = useState(medico.horariosAtendimento);

const handleSalvarPerfil = () => {
const medicoAtualizado: Medico = {
...medico,
nome,
email,
telefone,
especialidade,
horariosAtendimento,
};
onEditarPerfil(medicoAtualizado);
setEditMode(false);
};

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
className="flex flex-col h-full"
>
<div className="flex items-center gap-4 p-4 border-b border-white/10">
<Button variant="ghost" onClick={onVoltar} className="text-gray-400 hover:text-white">
<ChevronRight className="w-6 h-6 rotate-180" />
</Button>
<h2 className="text-2xl font-semibold text-white">Perfil do MĂŠdico</h2>
{!editMode && (
<Button
variant="ghost"
onClick={() => setEditMode(true)}
className="ml-auto text-gray-400 hover:text-white"
>
<Edit className="w-5 h-5" />
</Button>
)}
</div>
<div className="flex-1 p-4 overflow-y-auto">
<Card className="bg-white/5 border border-white/10 shadow-lg">
<CardHeader>
<div className="flex items-center gap-4">
<Avatar className="w-16 h-16">
<AvatarImage src={medico.foto} alt={medico.nome} />
<AvatarFallback>{medico.nome.substring(0, 2)}</AvatarFallback>
</Avatar>
<div>
<CardTitle className="text-2xl text-white">{editMode ? (
<Input
value={nome}
onChange={(e) => setNome(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
/>
) : (
medico.nome
)}</CardTitle>
<p className="text-gray-400">{medico.especialidade}</p>
</div>
</div>
</CardHeader>
<CardContent className="space-y-4">
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">InformaĂ§Ăľes de Contato:</h3>
<div className="flex items-center gap-2">
<Mail className="w-4 h-4 text-gray-400" />
{editMode ? (
<Input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
/>
) : (
<p className="text-white">{medico.email}</p>
)}
</div>
<div className="flex items-center gap-2">
<Phone className="w-4 h-4 text-gray-400" />
{editMode ? (
<Input
type="tel"
value={telefone}
onChange={(e) => setTelefone(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
/>
) : (
<p className="text-white">{medico.telefone}</p>
)}
</div>
</div>
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">Especialidade:</h3>
{editMode ? (
<Input
value={especialidade}
onChange={(e) => setEspecialidade(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
/>
) : (
<p className="text-white">{medico.especialidade}</p>
)}
</div>
<div className="space-y-2">
<h3 className="text-lg font-semibold text-gray-300">HorĂĄrios de Atendimento:</h3>
{editMode ? (
<Input
value={horariosAtendimento}
onChange={(e) => setHorariosAtendimento(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
/>
) : (
<div className="flex items-center gap-2">
<Clock className="w-4 h-4 text-gray-400" />
<p className="text-white">{medico.horariosAtendimento}</p>
</div>
)}
</div>
{editMode && (
<div className="flex justify-end gap-4 mt-4">
<Button
variant="outline"
onClick={() => setEditMode(false)}
className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 hover:text-gray-300 border-gray-500/30"
>
Cancelar
</Button>
<Button
onClick={handleSalvarPerfil}
className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border-green-500/30"
>
Salvar
</Button>
</div>
)}
</CardContent>
</Card>
</div>
</motion.div>
);
};

// Componente para ConfiguraĂ§Ăľes
const ConfiguracoesScreen = ({ onVoltar, onAlterarSenha }: { onVoltar: () => void, onAlterarSenha: () => void }) => {

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
className="flex flex-col h-full"
>
<div className="flex items-center gap-4 p-4 border-b border-white/10">
<Button variant="ghost" onClick={onVoltar} className="text-gray-400 hover:text-white">
<ChevronRight className="w-6 h-6 rotate-180" />
</Button>
<h2 className="text-2xl font-semibold text-white">ConfiguraĂ§Ăľes</h2>
</div>
<div className="flex-1 p-4 overflow-y-auto space-y-4">
<Card className="bg-white/5 border border-white/10 shadow-lg">
<CardHeader>
<CardTitle className="text-lg text-white">PreferĂŞncias</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
<div className="space-y-2">
<Label className="text-white">Tipo de Terapia PadrĂŁo</Label>
<Input
placeholder="Ex: Receptiva, Ativa"
className="bg-black/20 text-white border-purple-500/30"
/>
</div>
<div className="space-y-2">
<Label className="text-white">NotificaĂ§Ăľes</Label>
<div className="flex items-center gap-4">
<label className="relative inline-flex items-center mr-5 cursor-pointer">
<input type="checkbox" value="" className="sr-only peer" checked />
<div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
<span className="ml-3 text-sm font-medium text-white dark:text-gray-300">NotificaĂ§Ăľes de SessĂľes</span>
</label>
</div>
</div>
<div className="space-y-2">
<Label className="text-white">HorĂĄrio de Disponibilidade</Label>
<Input
placeholder="Ex: Seg a Sex, 09:00 - 18:00"
className="bg-black/20 text-white border-purple-500/30"
/>
</div>
<div className="space-y-2">
<Label className="text-white">Forma de Contato Preferencial</Label>
<Input
placeholder="Ex: Telefone, Email"
className="bg-black/20 text-white border-purple-500/30"
/>
</div>
</CardContent>
</Card>
<Card className="bg-white/5 border border-white/10 shadow-lg">
<CardHeader>
<CardTitle className="text-lg text-white">SeguranĂ§a</CardTitle>
</CardHeader>
<CardContent>
<Button
onClick={onAlterarSenha}
className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 border-purple-500/30"
>
<KeyRound className="w-4 h-4 mr-2" />
Alterar Senha
</Button>
</CardContent>
</Card>
</div>
</motion.div>
)
}

// Componente para Alterar Senha
const AlterarSenhaScreen = ({ onVoltar, onSenhaAlterada }: { onVoltar: () => void, onSenhaAlterada: () => void }) => {
const [senhaAntiga, setSenhaAntiga] = useState('');
const [novaSenha, setNovaSenha] = useState('');
const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
const [alterando, setAlterando] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAlterarSenha = async () => {
setError(null);
if (!senhaAntiga || !novaSenha || !confirmarNovaSenha) {
setError('Por favor, preencha todos os campos.');
return;
}

if (novaSenha !== confirmarNovaSenha) {
setError('As novas senhas nĂŁo coincidem.');
return;
}

if (novaSenha.length < 8) { // Exemplo de validaĂ§ĂŁo de senha
setError('A nova senha deve ter pelo menos 8 caracteres.');
return;
}

setAlterando(true);
// Simular chamada Ă  API
await new Promise(resolve => setTimeout(resolve, 1500));

// Simular sucesso
onSenhaAlterada();
setAlterando(false);
onVoltar();
};

return (
<motion.div
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
className="flex flex-col h-full p-4"
>
<div className="flex items-center gap-4 mb-6">
<Button variant="ghost" onClick={onVoltar} className="text-gray-400 hover:text-white">
<ChevronRight className="w-6 h-6 rotate-180" />
</Button>
<h2 className="text-2xl font-semibold text-white">Alterar Senha</h2>
</div>

<Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
<CardContent className="space-y-4">
<div className="space-y-2">
<Label htmlFor="senhaAntiga" className="text-white">Senha Antiga</Label>
<Input
id="senhaAntiga"
type="password"
value={senhaAntiga}
onChange={(e) => setSenhaAntiga(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="Digite sua senha antiga"
/>
</div>
<div className="space-y-2">
<Label htmlFor="novaSenha" className="text-white">Nova Senha</Label>
<Input
id="novaSenha"
type="password"
value={novaSenha}
onChange={(e) => setNovaSenha(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="Digite sua nova senha"
/>
</div>
<div className="space-y-2">
<Label htmlFor="confirmarNovaSenha" className="text-white">Confirmar Nova Senha</Label>
<Input
id="confirmarNovaSenha"
type="password"
value={confirmarNovaSenha}
onChange={(e) => setConfirmarNovaSenha(e.target.value)}
className="bg-black/20 text-white border-purple-500/30"
placeholder="Confirme sua nova senha"
/>
</div>
{error && (
<p className="text-red-400 text-sm">{error}</p>
)}
<Button
onClick={handleAlterarSenha}
className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border-green-500/30 mt-4"
disabled={alterando}
>
{alterando ? 'Alterando...' : 'Alterar Senha'}
</Button>
</CardContent>
</Card>
</motion.div>
);
};

// Componente da Tela Inicial
const HomeScreen = ({ medico, pacientes, onLogout, onSelectPaciente, onAgendarSessao }: { medico: Medico; pacientes: Paciente[]; onLogout: () => void; onSelectPaciente: (id: string) => void; onAgendarSessao: (pacienteId: string) => void }) => {
const [showWelcome, setShowWelcome] = useState(true);
const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
const [sessoes, setSessoes] = useState<Sessao[]>(sessoesMock);

useEffect(() => {
const timer = setTimeout(() => {
setShowWelcome(false);
}, 3000);

return () => clearTimeout(timer);
}, []);

const handleSessaoAgendada = useCallback((novaSessao: Sessao) => {
setSessoes(prevSessoes => [...prevSessoes, novaSessao]);
}, []);

if (selectedPacienteId) {
const pacienteSelecionado = pacientes.find(p => p.id === selectedPacienteId);
if (!pacienteSelecionado) {
return (
<div className="flex items-center justify-center h-full">
<p className="text-red-500">Paciente nĂŁo encontrado.</p>
</div>
);
}
return (
<DetalhesPaciente
paciente={pacienteSelecionado}
onVoltar={() => setSelectedPacienteId(null)}
onAgendarSessao={(pacienteId) => {
//setSelectedPacienteId(null); // Talvez nĂŁo queira limpar aqui, dependendo do fluxo
}}
sessoes={sessoes}
/>
);
}

return (
<div className="flex flex-col h-full">
{/* CabeĂ§alho */}
<div className="flex items-center justify-between p-4 border-b border-white/10">
<div className="flex items-center gap-2">
<Music className="w-6 h-6 text-purple-400" />
<h1 className="text-2xl font-bold text-white">Viscelius</h1>
</div>
<Button
variant="outline"
onClick={onLogout}
className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-red-500/30"
>
<LogOut className="w-4 h-4 mr-2" />
Sair
</Button>
</div>

{/* Mensagem de Boas-vindas */}
<AnimatePresence>
{showWelcome && (
<motion.div
initial={{ opacity: 0, y: -20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 20 }}
className="p-4 text-center"
>
<h2 className="text-xl font-semibold text-purple-300">
Bem-vindo(a), {medico.nome}!
</h2>
<p className="text-gray-400">
Gerencie seus pacientes e acompanhe o progresso da terapia.
</p>
<CheckCircle className="w-10 h-10 mx-auto mt-4 text-green-400" />
</motion.div>
)}
</AnimatePresence>

{/* ConteĂşdo Principal */}
<div className="flex-1 p-4 overflow-y-auto">
<h2 className="text-xl font-semibold text-white mb-4">Seus Pacientes</h2>
<ScrollArea className="h-[calc(100vh-200px)] rounded-md">
<div className="space-y-3">
<AnimatePresence>
{pacientes.map((paciente) => (
<PacienteItem
key={paciente.id}
paciente={paciente}
onSelectPaciente={(id) => setSelectedPacienteId(id)}
/>
))}
</AnimatePresence>
</div>
</ScrollArea>
{pacientes.length === 0 && (
<div className="text-center mt-6">
<AlertTriangle className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
<p className="text-gray-400">VocĂŞ ainda nĂŁo tem pacientes cadastrados.</p>
</div>
)}
</div>
</div>
);
};

const VisceliusApp = () => {
const [crm, setCrm] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [pacientes, setPacientes] = useState<Paciente[]>(pacientesMock);
const [medico, setMedico] = useState<Medico>(medicoMock);
const [telaAtual, setTelaAtual] = useState<'login' | 'home' | 'detalhesPaciente' | 'agendarSessao' | 'perfil' | 'configuracoes' | 'alterarSenha'>('login');
const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
const [sessoes, setSessoes] = useState<Sessao[]>(sessoesMock);

const handleLogin = async () => {
setLoading(true);
setError(null);

try {
if (!crm) {
throw new Error("Por favor, insira seu CRM.");
}
if (crm.length < 4) {
throw new Error("CRM invĂĄlido. O CRM deve ter pelo menos 4 caracteres.");
}

// SimulaĂ§ĂŁo de chamada Ă  API
await new Promise(resolve => setTimeout(resolve, 1500));

// SimulaĂ§ĂŁo de sucesso
setIsLoggedIn(true);
setTelaAtual('home');
} catch (err: any) {
setError(err.message || "Ocorreu um erro durante o login.");
} finally {
setLoading(false);
}
};

const handleLogout = () => {
setIsLoggedIn(false);
setCrm('');
setTelaAtual('login');
};

const handleSelectPaciente = (id: string) => {
setSelectedPacienteId(id);
setTelaAtual('detalhesPaciente');
};

const handleAgendarSessao = (pacienteId: string) => {
setSelectedPacienteId(pacienteId);
setTelaAtual('agendarSessao');
};

const handleSessaoAgendada = useCallback((novaSessao: Sessao) => {
setSessoes(prevSessoes => [...prevSessoes, novaSessao]);
}, []);

const handleVoltar = () => {
if (telaAtual === 'detalhesPaciente' || telaAtual === 'agendarSessao' || telaAtual === 'perfil' || telaAtual === 'configuracoes' || telaAtual === 'alterarSenha') {
setTelaAtual('home');
}
};

const handleEditarPerfil = (medicoAtualizado: Medico) => {
setMedico(medicoAtualizado);
setTelaAtual('home'); // Voltar para a tela inicial apĂłs salvar
};

const handleSenhaAlterada = () => {
// LĂłgica para lidar com a alteraĂ§ĂŁo de senha (exibir mensagem de sucesso, etc.)
alert('Senha alterada com sucesso!');
};

switch (telaAtual) {
case 'login':
return (
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
<Card
className={cn(
"w-full max-w-md bg-white/5 backdrop-blur-md",
"border border-white/10 shadow-xl",
"rounded-xl p-6 space-y-4"
)}
>
<CardHeader className="space-y-1">
<CardTitle className="text-2xl font-semibold text-white text-center">
Viscelius
</CardTitle>
<CardDescription className="text-gray-300 text-center">
Aplicativo de Musicoterapia para Profissionais
</CardDescription>
</CardHeader>
<CardContent className="space-y-4">
<div className="space-y-2">
<Label htmlFor="crm" className="text-white">CRM do MĂŠdico</Label>
<Input
id="crm"
type="text"
value={crm}
onChange={(e) => setCrm(e.target.value)}
placeholder="Digite seu CRM"
className={cn(
"bg-black/20 text-white border-purple-500/30",
"placeholder:text-gray-400 focus-visible:ring-purple-500",
error && "border-red-500 focus-visible:ring-red-500"
)}
disabled={loading}
/>
{error && (
<p className="text-red-400 text-sm">{error}</p>
)}
</div>
<Button
onClick={handleLogin}
className={cn(
"w-full bg-gradient-to-r from-purple-500 to-blue-500",
"text-white font-semibold py-3 rounded-full",
"hover:from-purple-600 hover:to-blue-600",
"transition-all duration-300 shadow-lg",
loading && "opacity-70 cursor-not-allowed"
)}
disabled={loading}
>
{loading ? 'Carregando...' : 'Entrar'}
</Button>
</CardContent>
</Card>
</div>
);
case 'home':
return (
<HomeScreen
medico={medico}
pacientes={pacientes}
onLogout={handleLogout}
onSelectPaciente={handleSelectPaciente}
onAgendarSessao={handleAgendarSessao}
/>
);
case 'detalhesPaciente':
const pacienteSelecionado = pacientes.find(p => p.id === selectedPacienteId);
if (!pacienteSelecionado) {
return (
<div className="flex items-center justify-center h-full">
<p className="text-red-500">Paciente nĂŁo encontrado.</p>
</div>
);
}
return (
<DetalhesPaciente
paciente={pacienteSelecionado}
onVoltar={handleVoltar}
onAgendarSessao={handleAgendarSessao}
sessoes={sessoes}
/>
);
case 'agendarSessao':
if (!selectedPacienteId) {
return (
<div className="flex items-center justify-center h-full">
<p className="text-red-500">Nenhum paciente selecionado para agendar a sessĂŁo.</p>
</div>
);
}
return (
<AgendarSessaoScreen
pacienteId={selectedPacienteId}
onVoltar={handleVoltar}
onSessaoAgendada={handleSessaoAgendada}
/>
);
case 'perfil':
return (
<PerfilMedicoScreen
medico={medico}
onVoltar={handleVoltar}
onEditarPerfil={handleEditarPerfil}
/>
);
case 'configuracoes':
return (
<ConfiguracoesScreen
onVoltar={handleVoltar}
onAlterarSenha={() => setTelaAtual('alterarSenha')}
/>
);
case 'alterarSenha':
return (
<AlterarSenhaScreen
onVoltar={handleVoltar}
onSenhaAlterada={handleSenhaAlterada}
/>
);
default:
return (
<div className="flex items-center justify-center h-full">
<p className="text-red-500">Tela nĂŁo encontrada.</p>
</div>
);
}
};

export default VisceliusApp;
