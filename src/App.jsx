import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { cn } from "./lib/utils"
import { ScrollArea } from "./components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar"
import { Badge } from "./components/ui/badge"
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
    KeyRound,
    Play,
    Pause,
    StopCircle,
    Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Textarea } from "./components/ui/textarea"
import { Calendar as CalendarUI } from "./components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
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
    condicao: string; // Condição que necessita de musicoterapia
    progresso: string;
    avaliacao?: string;
    historicoEmocoes?: string[]; // Novo campo para o diário de emoções
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

interface Musicoterapia {
    id: string;
    titulo: string;
    descricao: string;
    tipo: string; // Ex: "Relaxamento", "Energia", "Cognitiva"
    duracaoMin: number;
    audioUrl: string; // Adicionado: URL do arquivo de áudio
}

// Dados Mock (substitua por dados reais do seu backend)
const medicoMock: Medico = {
    id: 'medico1',
    nome: 'Dra. Maria Oliveira',
    crm: '123456-SP',
    email: 'maria.oliveira@email.com',
    telefone: '(11) 99999-8888',
    especialidade: 'Musicoterapia Neurológica',
    foto: 'https://source.unsplash.com/random/100x100/?woman&1',
    horariosAtendimento: 'Seg a Sex, 09:00 - 18:00',
};

const pacientesMock: Paciente[] = [
    {
        id: '1', nome: 'João Silva', status: 'ativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&1',
        email: 'joao.silva@email.com', telefone: '(11) 98888-7777', condicao: 'Recuperação de AVC', progresso: 'Melhora na fala e coordenação.', avaliacao: 'Paciente motivado e colaborativo.', historicoEmocoes: ["Me senti bem hoje, a música ajudou a relaxar.", "Um pouco ansioso, mas a terapia de respiração com música acalmou."]
    },
    {
        id: '2', nome: 'Maria Souza', status: 'em tratamento', foto: 'https://source.unsplash.com/random/50x50/?portrait&2',
        email: 'maria.souza@email.com', telefone: '(21) 97777-6666', condicao: 'Autismo', progresso: 'Aumento da interação social.', avaliacao: 'Paciente responde bem à terapia com instrumentos.', historicoEmocoes: ["Dia tranquilo, gostei da música com percussão.", "Estressada com barulhos, a música suave ajudou a focar."]
    },
    {
        id: '3', nome: 'Carlos Pereira', status: 'inativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&3',
        email: 'carlos.pereira@email.com', telefone: '(15) 96666-5555', condicao: 'Parkinson', progresso: 'Sessões focadas na coordenação motora.', avaliacao: 'Paciente apresenta progressos lentos, mas constantes.', historicoEmocoes: ["Mãos tremeram menos durante a música.", "Senti mais controle hoje."]
    },
    {
        id: '4', nome: 'Ana Rodrigues', status: 'ativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&4',
        email: 'ana.rodrigues@email.com', telefone: '(19) 95555-4444', condicao: 'Depressão', progresso: 'Melhora no humor e expressão emocional.', avaliacao: 'Paciente engajada nas atividades musicais.', historicoEmocoes: ["Me senti mais leve depois da música.", "Ainda um pouco triste, mas a melodia trouxe conforto."]
    },
    {
        id: '5', nome: 'Pedro Martins', status: 'em tratamento', foto: 'https://source.unsplash.com/random/50x50/?portrait&5',
        email: 'pedro.martins@email.com', telefone: '(27) 94444-3333', condicao: 'Alzheimer', progresso: 'Sessões para estimular a memória.', avaliacao: 'Paciente responde bem a músicas conhecidas.', historicoEmocoes: ["Lembrei da minha infância com a música.", "A música me trouxe paz."]
    },
    {
        id: '6', nome: 'Julia Santos', status: 'ativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&6',
        email: 'julia.santos@email.com', telefone: '(31) 93333-2222', condicao: 'TDAH', progresso: 'Aumento da concentração e foco.', avaliacao: 'Paciente demonstra interesse em aprender instrumentos.', historicoEmocoes: ["Consegui focar mais tempo na aula de música.", "Menos inquieta hoje."]
    },
    {
        id: '7', nome: 'Lucas Oliveira', status: 'inativo', foto: 'https://source.unsplash.com/random/50x50/?portrait&7',
        email: 'lucas.oliveira@email.com', telefone: '(41) 92222-1111', condicao: 'Reabilitação pós-cirúrgica', progresso: 'Sessões para recuperação motora.', avaliacao: 'Paciente dedicado e otimista.', historicoEmocoes: ["A dor diminuiu com a música.", "Me sinto mais forte."]
    },
];

const sessoesMock: Sessao[] = [
    { id: 'sessao1', pacienteId: '1', data: new Date(Date.now() + 86400000), duracao: 60, tipoTerapia: 'Receptiva', anotacoes: 'Foco na escuta musical para relaxamento.' }, // Amanhã
    { id: 'sessao2', pacienteId: '2', data: new Date(Date.now() + (86400000 * 3)), duracao: 45, tipoTerapia: 'Ativa', anotacoes: 'Uso de instrumentos para expressão emocional.' }, // Em 3 dias
    { id: 'sessao3', pacienteId: '1', data: new Date(Date.now() - 86400000), duracao: 60, tipoTerapia: 'Receptiva', anotacoes: 'Paciente relatou melhora no humor.' }, // Ontem
    { id: 'sessao4', pacienteId: '3', data: new Date(Date.now() + (86400000 * 7)), duracao: 50, tipoTerapia: 'Improvisação', anotacoes: 'Sessão para estimular a criatividade.' }, // Em 7 dias
    { id: 'sessao5', pacienteId: '4', data: new Date(), duracao: 60, tipoTerapia: 'Receptiva', anotacoes: 'Sessão inicial de avaliação.' },
];

const musicoterapiasMock: Musicoterapia[] = [
    { id: 'mt1', titulo: 'Melodias para Relaxamento Profundo', descricao: 'Sons suaves e harmônicos para induzir um estado de calma.', tipo: 'Relaxamento', duracaoMin: 30, audioUrl: '/audios/teste.mp3' }, // Usando test.mp3
    { id: 'mt2', titulo: 'Ritmos para Foco e Concentração', descricao: 'Batidas binaurais e música instrumental para melhorar a atenção.', tipo: 'Cognitiva', duracaoMin: 45, audioUrl: '/audios/teste.mp3' }, // Usando test.mp3
    { id: 'mt3', titulo: 'Harmonias para Alívio da Ansiedade', descricao: 'Peças clássicas e ambientais que promovem bem-estar.', tipo: 'Bem-estar', duracaoMin: 25, audioUrl: '/audios/teste.mp3' },
    { id: 'mt4', titulo: 'Sons da Natureza para Meditação', descricao: 'Gravações de florestas, rios e pássaros para práticas meditativas.', tipo: 'Meditação', duracaoMin: 60, audioUrl: '/audios/teste.mp3' },
    { id: 'mt5', titulo: 'Musicoterapia Energizante Matinal', descricao: 'Músicas vibrantes e ritmadas para começar o dia com energia.', tipo: 'Energia', duracaoMin: 20, audioUrl: '/audios/teste.mp3' },
];

// Helper para formatar tempo (minutos:segundos)
const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

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

// Novo componente para Análise de Progresso com IA (Profissional)
const AnaliseProgressoIAScreen = ({ paciente, sessoes, onVoltar }: { paciente: Paciente, sessoes: Sessao[], onVoltar: () => void }) => {
    const [analiseResult, setAnaliseResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const performAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnaliseResult(null);

        try {
            const patientData = {
                nome: paciente.nome,
                condicao: paciente.condicao,
                progresso: paciente.progresso,
                avaliacao: paciente.avaliacao,
                anotacoesSessoes: sessoes.filter(s => s.pacienteId === paciente.id).map(s => s.anotacoes).join('; ')
            };

            const prompt = `Analise o seguinte progresso do paciente para musicoterapia e forneça um resumo conciso com insights e sugestões para os próximos passos.
            Dados do Paciente:
            Nome: ${patientData.nome}
            Condição: ${patientData.condicao}
            Progresso: ${patientData.progresso}
            Avaliação: ${patientData.avaliacao || 'Não disponível'}
            Anotações de Sessões Anteriores: ${patientData.anotacoesSessoes || 'Nenhuma anotação disponível.'}
            
            Por favor, resuma o estado atual do paciente e sugira 2-3 próximos passos na musicoterapia para otimizar o tratamento.`;

            const chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                setAnaliseResult(result.candidates[0].content.parts[0].text);
            } else {
                setAnalysisError("Não foi possível gerar a análise. Tente novamente.");
                console.error("Estrutura de resposta da API inesperada:", result);
            }
        } catch (err: any) {
            setAnalysisError(`Erro ao analisar o progresso: ${err.message}`);
            console.error("Erro na chamada da API Gemini:", err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [paciente, sessoes]);

    useEffect(() => {
        performAnalysis();
    }, [performAnalysis]);

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
                <h2 className="text-2xl font-semibold text-white">Análise de Progresso com IA</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Análise para {paciente.nome}</CardTitle>
                    <CardDescription className="text-gray-300">Insights gerados por inteligência artificial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isAnalyzing && (
                        <div className="flex items-center justify-center py-8">
                            <Sparkles className="w-8 h-8 text-sky-400 animate-pulse mr-2" />
                            <p className="text-sky-300">Gerando análise...</p>
                        </div>
                    )}
                    {analysisError && (
                        <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <p>{analysisError}</p>
                        </div>
                    )}
                    {analiseResult && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-300">Resultado da Análise:</h3>
                            <p className="text-white whitespace-pre-wrap">{analiseResult}</p>
                        </div>
                    )}
                    <Button
                        onClick={performAnalysis}
                        className="w-full bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:text-sky-300 border-sky-500/30 mt-4"
                        disabled={isAnalyzing}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Analisando...' : 'Re-analisar Progresso'}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};


// Componente para exibir detalhes do paciente
const DetalhesPaciente = ({ paciente, onVoltar, onAgendarSessao, sessoes, onAnaliseProgressoIA }: { paciente: Paciente; onVoltar: () => void; onAgendarSessao: (pacienteId: string) => void; sessoes: Sessao[]; onAnaliseProgressoIA: (pacienteId: string) => void }) => {
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
                            <h3 className="text-lg font-semibold text-gray-300">Informações de Contato:</h3>
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
                            <h3 className="text-lg font-semibold text-gray-300">Condição:</h3>
                            <p className="text-white">{paciente.condicao}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-300">Progresso:</h3>
                            <p className="text-white">{paciente.progresso}</p>
                        </div>
                        {paciente.avaliacao && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-300">Avaliação:</h3>
                                <p className="text-white">{paciente.avaliacao}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <Button
                                onClick={() => onAgendarSessao(paciente.id)}
                                className="flex-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:text-sky-300 border-sky-500/30"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar Sessão
                            </Button>
                            <Button
                                onClick={() => onAnaliseProgressoIA(paciente.id)}
                                className="flex-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-300 border-indigo-500/30"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Análise com IA
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Sessões Agendadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pacienteSessoes.length === 0 ? (
                            <p className="text-gray-400">Nenhuma sessão agendada para este paciente.</p>
                        ) : (
                            <div className="space-y-3">
                                {pacienteSessoes.map((sessao) => (
                                    <div key={sessao.id} className="p-3 rounded-lg bg-black/20 text-white border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p><span className="font-semibold">Data:</span> {format(sessao.data, 'dd/MM/yyyy', { locale: ptBR })}</p>
                                                <p><span className="font-semibold">Hora:</span> {format(sessao.data, 'HH:mm')}</p>
                                                <p><span className="font-semibold">Duração:</span> {sessao.duracao} minutos</p>
                                                <p><span className="font-semibold">Tipo:</span> {sessao.tipoTerapia}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:text-sky-300 border-sky-500/30"
                                            >
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                        <div className="mt-2">
                                            <span className="font-semibold">Anotações:</span>
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

// Componente para Agendar Sessão
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
            // Usar um componente de alerta melhor, por enquanto um console.error
            console.error('Por favor, preencha todos os campos.');
            return;
        }

        setAgendando(true);
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));

        const dataHora = new Date(data);
        const [horaStr, minutoStr] = hora.split(':');
        dataHora.setHours(parseInt(horaStr, 10));
        dataHora.setMinutes(parseInt(minutoStr, 10));

        const novaSessao: Sessao = {
            id: `sessao-${Date.now()}`, // Gerar um ID único
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
                <p className="text-red-500">Paciente não encontrado.</p>
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
                <h2 className="text-2xl font-semibold text-white">Agendar Sessão</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Agendar Sessão para {paciente.nome}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="data" className="text-white">Data</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-black/20 text-white border-sky-500/30",
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
                            className="bg-black/20 text-white border-sky-500/30"
                            placeholder="HH:MM"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duracao" className="text-white">Duração (minutos)</Label>
                        <Input
                            id="duracao"
                            type="number"
                            value={duracao}
                            onChange={(e) => setDuracao(e.target.value)}
                            className="bg-black/20 text-white border-sky-500/30"
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
                            className="bg-black/20 text-white border-sky-500/30"
                            placeholder="Ex: Receptiva, Ativa"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="anotacoes" className="text-white">Anotações</Label>
                        <Textarea
                            id="anotacoes"
                            value={anotacoes}
                            onChange={(e) => setAnotacoes(e.target.value)}
                            className="bg-black/20 text-white border-sky-500/30"
                            placeholder="Anotações sobre a sessão..."
                            rows={4}
                        />
                    </div>

                    <Button
                        onClick={handleAgendar}
                        className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border-green-500/30 mt-4"
                        disabled={agendando}
                    >
                        {agendando ? 'Agendando...' : 'Agendar Sessão'}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Componente para Perfil do Médico
const PerfilMedicoScreen = ({ medico, onVoltar, onEditarPerfil }: { medico: Medico; onVoltar: () => void, onEditarPerfil: (medico: Medico) => void }) => {
    const [editMode, setEditMode] = useState(false);
    const [nome, setNome] = useState(medico.nome);
    const [email, setEmail] = useState(medico.email);
    const [telefone, setTelefone] = useState(medico.telefone);
    const [especialidade, setEspecialidade] = useState(medico.especialidade);
    const [horariosAtendimento, setHorariosAtendimento] = useState(medico.horariosAtendimento);
    const [showSaveMessage, setShowSaveMessage] = useState(false);

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
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000); // Hide message after 3 seconds
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
                <h2 className="text-2xl font-semibold text-white">Perfil do Médico</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={medico.foto} alt={medico.nome} />
                                <AvatarFallback>{medico.nome.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl text-white">{medico.nome}</CardTitle>
                                <CardDescription className="text-gray-300">{medico.especialidade}</CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setEditMode(!editMode)}
                            className="text-sky-400 hover:text-sky-300"
                        >
                            <Edit className="w-5 h-5 mr-2" />
                            {editMode ? 'Cancelar' : 'Editar'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showSaveMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-green-500/20 text-green-400 border border-green-500/30 p-3 rounded-lg text-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Perfil atualizado com sucesso!
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-white">Nome</Label>
                        {editMode ? (
                            <Input value={nome} onChange={(e) => setNome(e.target.value)} className="bg-black/20 text-white border-sky-500/30" />
                        ) : (
                            <p className="text-white p-2 bg-black/10 rounded-md">{medico.nome}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">CRM</Label>
                        <p className="text-white p-2 bg-black/10 rounded-md">{medico.crm}</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Email</Label>
                        {editMode ? (
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/20 text-white border-sky-500/30" />
                        ) : (
                            <p className="text-white p-2 bg-black/10 rounded-md">{medico.email}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Telefone</Label>
                        {editMode ? (
                            <Input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="bg-black/20 text-white border-sky-500/30" />
                        ) : (
                            <p className="text-white p-2 bg-black/10 rounded-md">{medico.telefone}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Especialidade</Label>
                        {editMode ? (
                            <Input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} className="bg-black/20 text-white border-sky-500/30" />
                        ) : (
                            <p className="text-white p-2 bg-black/10 rounded-md">{medico.especialidade}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Horário de Atendimento</Label>
                        {editMode ? (
                            <Input value={horariosAtendimento} onChange={(e) => setHorariosAtendimento(e.target.value)} className="bg-black/20 text-white border-sky-500/30" />
                        ) : (
                            <p className="text-white p-2 bg-black/10 rounded-md">{medico.horariosAtendimento}</p>
                        )}
                    </div>

                    {editMode && (
                        <Button
                            onClick={handleSalvarPerfil}
                            className="w-full bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border-green-500/30 mt-4"
                        >
                            Salvar Alterações
                        </Button>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Componente para Alterar Senha
const AlterarSenhaScreen = ({ onVoltar, onSenhaAlterada }: { onVoltar: () => void, onSenhaAlterada: () => void }) => {
    const [senhaAntiga, setSenhaAntiga] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [alterando, setAlterando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleAlterarSenha = async () => {
        setError(null);
        setSuccessMessage(null);
        if (!senhaAntiga || !novaSenha || !confirmarNovaSenha) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarNovaSenha) {
            setError('As novas senhas não coincidem.');
            return;
        }

        if (novaSenha.length < 8) { // Exemplo de validação de senha
            setError('A nova senha deve ter pelo menos 8 caracteres.');
            return;
        }

        setAlterando(true);
        // Simular chamada à API
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simular sucesso
        setSuccessMessage('Senha alterada com sucesso!');
        onSenhaAlterada(); // Notifica o componente pai
        setAlterando(false);
        setTimeout(() => {
            setSuccessMessage(null);
            onVoltar();
        }, 1500); // Wait a bit before navigating back
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
                            className="bg-black/20 text-white border-sky-500/30"
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
                            className="bg-black/20 text-white border-sky-500/30"
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
                            className="bg-black/20 text-white border-sky-500/30"
                            placeholder="Confirme sua nova senha"
                        />
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                    {successMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-green-400 text-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {successMessage}
                        </motion.p>
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

// Componente para Configurações (Placeholder)
const ConfiguracoesScreen = ({ onVoltar, onAlterarSenha }: { onVoltar: () => void, onAlterarSenha: () => void }) => {
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
                <h2 className="text-2xl font-semibold text-white">Configurações</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Opções do Aplicativo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-white">Notificações</Label>
                        <div className="flex items-center gap-4">
                            <label className="relative inline-flex items-center mr-5 cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                                <span className="ml-3 text-sm font-medium text-white dark:text-gray-300">Receber notificações de sessões</span>
                            </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">Tema</Label>
                        <p className="text-gray-400">Atualmente no tema escuro. Opções de tema em breve.</p>
                    </div>
                    <Button
                        onClick={onAlterarSenha}
                        className="w-full bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:text-sky-300 border-sky-500/30 mt-4"
                    >
                        <KeyRound className="w-4 h-4 mr-2" />
                        Alterar Senha
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};


// Componente da Tela Inicial
const HomeScreen = ({ medico, pacientes, onLogout, onSelectPaciente, onAgendarSessao, onAnaliseProgressoIA }: { medico: Medico; pacientes: Paciente[]; onLogout: () => void; onSelectPaciente: (id: string) => void; onAgendarSessao: (pacienteId: string) => void; onAnaliseProgressoIA: (pacienteId: string) => void }) => {
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Music className="w-6 h-6 text-sky-400" />
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
                        <h2 className="text-xl font-semibold text-sky-300">
                            Bem-vindo(a), {medico.nome}!
                        </h2>
                        <p className="text-gray-400">
                            Gerencie seus pacientes e acompanhe o progresso da terapia.
                        </p>
                        <CheckCircle className="w-10 h-10 mx-auto mt-4 text-green-400" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conteúdo Principal */}
            <div className="flex-1 p-4 overflow-y-auto">
                <h2 className="text-xl font-semibold text-white mb-4">Seus Pacientes</h2>
                <ScrollArea className="h-[calc(100vh-200px)] rounded-md">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {pacientes.map((paciente) => (
                                <PacienteItem
                                    key={paciente.id}
                                    paciente={paciente}
                                    onSelectPaciente={onSelectPaciente} // Changed to direct prop
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
                {pacientes.length === 0 && (
                    <div className="text-center mt-6">
                        <AlertTriangle className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
                        <p className="text-gray-400">Você ainda não tem pacientes cadastrados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente de Login para Pacientes
const LoginPacienteScreen = ({ onLoginPaciente, onVoltar }: { onLoginPaciente: (pacienteId: string) => void; onVoltar: () => void }) => {
    const [pacienteId, setPacienteId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!pacienteId) {
                throw new Error("Por favor, insira seu ID de Paciente.");
            }
            const pacienteEncontrado = pacientesMock.find(p => p.id === pacienteId);
            if (!pacienteEncontrado) {
                throw new Error("ID de Paciente inválido. Tente novamente.");
            }

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulação de API

            onLoginPaciente(pacienteId);
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro durante o login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
            <Card
                className={cn(
                    "w-full max-w-md bg-white/5 backdrop-blur-md",
                    "border border-white/10 shadow-xl",
                    "rounded-xl p-6 space-y-4"
                )}
            >
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-semibold text-white text-center">
                        Login do Paciente
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-center">
                        Acesse sua área de musicoterapia
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pacienteId" className="text-white">ID do Paciente</Label>
                        <Input
                            id="pacienteId"
                            type="text"
                            value={pacienteId}
                            onChange={(e) => setPacienteId(e.target.value)}
                            placeholder="Digite seu ID"
                            className={cn(
                                "bg-black/20 text-white border-cyan-500/30", // Changed border color for patient login
                                "placeholder:text-gray-400 focus-visible:ring-cyan-500", // Changed ring color
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
                            "w-full bg-gradient-to-r from-cyan-600 to-sky-700", // Adjusted gradient for patient login
                            "text-white font-semibold py-3 rounded-full",
                            "hover:from-cyan-700 hover:to-sky-800",
                            "transition-all duration-300 shadow-lg",
                            loading && "opacity-70 cursor-not-allowed"
                        )}
                        disabled={loading}
                    >
                        {loading ? 'Carregando...' : 'Entrar'}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onVoltar}
                        className="w-full text-gray-400 hover:text-white"
                    >
                        Voltar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

// Componente da Tela Inicial do Paciente
const HomePacienteScreen = ({ paciente, medico, onLogout, onGoToMusicLibrary, onGoToMedicoDetails, onGoToDiarioEmocoes }: { paciente: Paciente; medico: Medico; onLogout: () => void; onGoToMusicLibrary: () => void; onGoToMedicoDetails: () => void; onGoToDiarioEmocoes: () => void }) => {
    const [showWelcome, setShowWelcome] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col h-full">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Music className="w-6 h-6 text-sky-400" />
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
                        <h2 className="text-xl font-semibold text-sky-300">
                            Olá, {paciente.nome}!
                        </h2>
                        <p className="text-gray-400">
                            Bem-vindo(a) à sua jornada de musicoterapia.
                        </p>
                        <CheckCircle className="w-10 h-10 mx-auto mt-4 text-green-400" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Conteúdo Principal */}
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
                <Card
                    className="bg-white/5 border border-white/10 shadow-lg cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={onGoToMedicoDetails} // Make the card clickable
                >
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Seu Musicoterapeuta</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={medico.foto} alt={medico.nome} />
                            <AvatarFallback>{medico.nome.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-semibold text-white">{medico.nome}</p>
                            <p className="text-gray-300">{medico.especialidade}</p>
                            <p className="text-gray-400 text-sm">CRM: {medico.crm}</p>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    onClick={onGoToMusicLibrary}
                    className="w-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 border-cyan-500/30 mt-6"
                >
                    <Music className="w-4 h-4 mr-2" />
                    Acessar Biblioteca de Músicas
                </Button>

                <Button
                    onClick={onGoToDiarioEmocoes}
                    className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 border-purple-500/30 mt-6" // Using purple for emotion journal
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Diário de Emoções
                </Button>

                {/* Adicione mais seções aqui, como próximas sessões, progresso, etc. */}
            </div>
        </div>
    );
};

// Componente da Biblioteca de Músicas
const BibliotecaMusicasScreen = ({ onVoltar, onPlayMusic, isPlaying, currentPlayingTrack, playbackProgress, elapsedTime }: {
    onVoltar: () => void;
    onPlayMusic: (terapia: Musicoterapia, resumeFrom?: number) => void;
    isPlaying: boolean;
    currentPlayingTrack: Musicoterapia | null;
    playbackProgress: number;
    elapsedTime: number;
}) => {

    const handlePlayButtonClick = (terapia: Musicoterapia) => {
        // If this track is already playing and paused, resume it.
        if (currentPlayingTrack?.id === terapia.id && !isPlaying) {
            onPlayMusic(terapia, elapsedTime); // Resume from current elapsed time
        } else {
            // Otherwise, play this track from the beginning.
            onPlayMusic(terapia);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full p-4 pb-4" // Removed extra pb-20 as player is global now
        >
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={onVoltar} className="text-gray-400 hover:text-white">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                </Button>
                <h2 className="text-2xl font-semibold text-white">Biblioteca de Músicas</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Terapias Musicais Disponíveis</CardTitle>
                    <CardDescription className="text-gray-400">Escolha uma terapia para ouvir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {musicoterapiasMock.length === 0 ? (
                        <p className="text-gray-400">Nenhuma musicoterapia disponível no momento.</p>
                    ) : (
                        <div className="space-y-3">
                            {musicoterapiasMock.map((terapia) => (
                                <div key={terapia.id} className="p-3 rounded-lg bg-black/20 text-white border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-lg">{terapia.titulo}</p>
                                            <p className="text-gray-300 text-sm">{terapia.descricao}</p>
                                            <p className="text-gray-400 text-xs">Tipo: {terapia.tipo} | Duração: {terapia.duracaoMin} min</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handlePlayButtonClick(terapia)} // Corrected call
                                            className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 border-cyan-500/30"
                                        >
                                            {currentPlayingTrack?.id === terapia.id && isPlaying ? (
                                                <Pause className="w-4 h-4" />
                                            ) : currentPlayingTrack?.id === terapia.id && !isPlaying ? (
                                                <Play className="w-4 h-4" />
                                            ) : (
                                                <Play className="w-4 h-4" />
                                            )}
                                            <span className="ml-2">
                                                {currentPlayingTrack?.id === terapia.id && isPlaying ? 'Pausar' : currentPlayingTrack?.id === terapia.id && !isPlaying ? 'Retomar' : 'Ouvir'}
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Novo componente para detalhes do musicoterapeuta para o paciente
const DetalhesMusicoterapeutaPaciente = ({ medico, onVoltar, onSolicitarAgendamento }: { medico: Medico; onVoltar: () => void; onSolicitarAgendamento: () => void }) => {
    const [showRequestMessage, setShowRequestMessage] = useState(false);

    const handleSolicitar = () => {
        onSolicitarAgendamento();
        setShowRequestMessage(true);
        setTimeout(() => setShowRequestMessage(false), 3000); // Hide message after 3 seconds
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
                <h2 className="text-2xl font-semibold text-white">Detalhes do Musicoterapeuta</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={medico.foto} alt={medico.nome} />
                            <AvatarFallback>{medico.nome.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl text-white">{medico.nome}</CardTitle>
                            <CardDescription className="text-gray-300">{medico.especialidade}</CardDescription>
                            <p className="text-gray-400 text-sm">CRM: {medico.crm}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showRequestMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-green-500/20 text-green-400 border border-green-500/30 p-3 rounded-lg text-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Solicitação de agendamento enviada!
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-300">Informações de Contato:</h3>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p className="text-white">{medico.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <p className="text-white">{medico.telefone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <p className="text-white">{medico.horariosAtendimento}</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSolicitar}
                        className="w-full bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 hover:text-sky-300 border-sky-500/30 mt-4"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Solicitar Agendamento
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Componente para Diário de Emoções do Paciente com IA
const DiarioEmocoesScreen = ({ paciente, onVoltar }: { paciente: Paciente, onVoltar: () => void }) => {
    const [entryText, setEntryText] = useState('');
    const [reflectionResult, setReflectionResult] = useState<string | null>(null);
    const [isReflecting, setIsReflecting] = useState(false);
    const [reflectionError, setReflectionError] = useState<string | null>(null);
    const [historicoLocal, setHistoricoLocal] = useState<string[]>(paciente.historicoEmocoes || []); // Usar histórico do paciente mock

    const handleGenerateReflection = useCallback(async () => {
        setIsReflecting(true);
        setReflectionError(null);
        setReflectionResult(null);

        if (!entryText.trim()) {
            setReflectionError("Por favor, escreva algo no diário antes de gerar uma reflexão.");
            setIsReflecting(false);
            return;
        }

        try {
            const prompt = `O paciente ${paciente.nome} escreveu a seguinte entrada no diário de emoções: "${entryText}".
            Com base nesta entrada, forneça uma reflexão empática e construtiva, sem julgamentos. Use uma linguagem acolhedora e positiva. Sugira como a musicoterapia pode ser relevante para o que foi expresso.`;

            const chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const generatedReflection = result.candidates[0].content.parts[0].text;
                setReflectionResult(generatedReflection);
                // Add to local history (in a real app, this would be persisted)
                setHistoricoLocal(prev => [...prev, `**${format(new Date(), 'dd/MM/yyyy HH:mm')}**: ${entryText}\n*Reflexão:* ${generatedReflection}`]);
                setEntryText(''); // Clear input after successful reflection
            } else {
                setReflectionError("Não foi possível gerar a reflexão. Tente novamente.");
                console.error("Estrutura de resposta da API inesperada:", result);
            }
        } catch (err: any) {
            setReflectionError(`Erro ao gerar reflexão: ${err.message}`);
            console.error("Erro na chamada da API Gemini:", err);
        } finally {
            setIsReflecting(false);
        }
    }, [entryText, paciente.nome]);

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
                <h2 className="text-2xl font-semibold text-white">Diário de Emoções</h2>
            </div>

            <Card className="bg-white/5 border border-white/10 shadow-lg flex-1 overflow-y-auto">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Compartilhe suas Emoções</CardTitle>
                    <CardDescription className="text-gray-300">Escreva sobre como você se sentiu hoje e receba uma reflexão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="entryText" className="text-white">Sua entrada no diário:</Label>
                        <Textarea
                            id="entryText"
                            value={entryText}
                            onChange={(e) => setEntryText(e.target.value)}
                            className="bg-black/20 text-white border-purple-500/30"
                            placeholder="Ex: Hoje me senti um pouco sobrecarregado, mas ouvir música clássica me ajudou a relaxar."
                            rows={6}
                        />
                    </div>
                    <Button
                        onClick={handleGenerateReflection}
                        className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 border-purple-500/30"
                        disabled={isReflecting}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isReflecting ? 'Gerando Reflexão...' : 'Gerar Reflexão'}
                    </Button>

                    {reflectionError && (
                        <div className="bg-red-500/20 text-red-400 border border-red-500/30 p-3 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <p>{reflectionError}</p>
                        </div>
                    )}
                    {reflectionResult && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-300">Sua Reflexão:</h3>
                            <p className="text-white whitespace-pre-wrap">{reflectionResult}</p>
                        </div>
                    )}

                    <div className="space-y-3 mt-8">
                        <h3 className="text-lg font-semibold text-gray-300">Histórico de Entradas:</h3>
                        {historicoLocal.length === 0 ? (
                            <p className="text-gray-400">Nenhuma entrada anterior.</p>
                        ) : (
                            <div className="space-y-3">
                                {historicoLocal.map((entry, index) => (
                                    <div key={index} className="p-3 rounded-lg bg-black/20 text-white border border-white/10">
                                        <p className="text-sm text-gray-300" dangerouslySetInnerHTML={{ __html: entry.replace(/\n/g, '<br/>') }}></p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};


const App = () => { // Renamed from VisceliusApp to App
    const [crm, setCrm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // For professional login
    const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false); // For patient login
    const [currentPatient, setCurrentPatient] = useState<Paciente | null>(null);

    const [pacientes, setPacientes] = useState<Paciente[]>(pacientesMock);
    const [medico, setMedico] = useState<Medico>(medicoMock);
    const [telaAtual, setTelaAtual] = useState<'login' | 'home' | 'detalhesPaciente' | 'agendarSessao' | 'perfil' | 'configuracoes' | 'alterarSenha' | 'loginPaciente' | 'homePaciente' | 'bibliotecaMusicas' | 'detalhesMusicoterapeutaPaciente' | 'solicitacaoAgendamento' | 'analiseProgressoIA' | 'diarioEmocoes'>('login');
    const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
    const [sessoes, setSessoes] = useState<Sessao[]>(sessoesMock);
    const [globalMessage, setGlobalMessage] = useState<string | null>(null); // For global success/error messages

    // Global Player States
    const [isPlayingGlobally, setIsPlayingGlobally] = useState(false);
    const [currentPlayingTrackGlobally, setCurrentPlayingTrackGlobally] = useState<Musicoterapia | null>(null);
    const [playbackProgressGlobally, setPlaybackProgressGlobally] = useState(0); // 0-100
    const [elapsedTimeGlobally, setElapsedTimeGlobally] = useState(0); // in seconds

    // Web Audio API refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const playbackStartTimeRef = useRef(0); // Time in AudioContext.currentTime when playback started
    const pauseOffsetRef = useRef(0); // Time in seconds where the track was paused

    // Visualizer refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const bufferLengthRef = useRef<number>(0);
    const dataArrayRef = useRef<Uint8Array | null>(null);


    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!crm) {
                throw new Error("Por favor, insira seu CRM.");
            }
            if (crm.length < 4) {
                throw new Error("CRM inválido. O CRM deve ter pelo menos 4 caracteres.");
            }

            // Simulação de chamada à API
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulação de sucesso
            setIsLoggedIn(true);
            setTelaAtual('home');
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro durante o login.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginPaciente = (pacienteId: string) => {
        const pacienteEncontrado = pacientesMock.find(p => p.id === pacienteId);
        if (pacienteEncontrado) {
            setCurrentPatient(pacienteEncontrado);
            setIsPatientLoggedIn(true);
            setTelaAtual('homePaciente');
        } else {
            console.error("Paciente não encontrado para o ID fornecido.");
            // Poderia exibir um erro global ou no LoginPacienteScreen
        }
    };


    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsPatientLoggedIn(false);
        setCrm('');
        setCurrentPatient(null);
        setTelaAtual('login');
        // Stop global music player on logout
        handleStopMusicGlobal();
    };

    const handleSelectPaciente = (id: string) => {
        setSelectedPacienteId(id);
        setTelaAtual('detalhesPaciente');
    };

    const handleAgendarSessao = (pacienteId: string) => {
        setSelectedPacienteId(pacienteId);
        setTelaAtual('agendarSessao');
    };

    const handleAnaliseProgressoIA = (pacienteId: string) => {
        setSelectedPacienteId(pacienteId);
        setTelaAtual('analiseProgressoIA');
    };

    const handleGoToDiarioEmocoes = () => {
        setTelaAtual('diarioEmocoes');
    };


    const handleSessaoAgendada = useCallback((novaSessao: Sessao) => {
        setSessoes(prevSessoes => [...prevSessoes, novaSessao]);
        setGlobalMessage('Sessão agendada com sucesso!');
        setTimeout(() => setGlobalMessage(null), 3000);
    }, []);

    const handleVoltar = () => {
        if (telaAtual === 'detalhesPaciente' || telaAtual === 'agendarSessao' || telaAtual === 'perfil' || telaAtual === 'configuracoes' || telaAtual === 'alterarSenha' || telaAtual === 'analiseProgressoIA') {
            setTelaAtual('home');
        } else if (telaAtual === 'bibliotecaMusicas') {
            setTelaAtual('homePaciente');
        } else if (telaAtual === 'detalhesMusicoterapeutaPaciente') {
            setTelaAtual('homePaciente');
        } else if (telaAtual === 'solicitacaoAgendamento') {
            setTelaAtual('detalhesMusicoterapeutaPaciente');
        } else if (telaAtual === 'diarioEmocoes') {
            setTelaAtual('homePaciente');
        } else if (telaAtual === 'homePaciente') { // This path should only go back to patient login if patient is logged in
            setTelaAtual('loginPaciente');
        } else if (telaAtual === 'loginPaciente') { // From patient login back to initial selector
            setTelaAtual('login');
        }
    };

    const handleEditarPerfil = (medicoAtualizado: Medico) => {
        setMedico(medicoAtualizado);
        setTelaAtual('home'); // Voltar para a tela inicial após salvar
        setGlobalMessage('Perfil atualizado com sucesso!');
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleSenhaAlterada = () => {
        setGlobalMessage('Senha alterada com sucesso!');
        setTimeout(() => setGlobalMessage(null), 3000);
    };

    const handleGoToMusicLibrary = () => {
        setTelaAtual('bibliotecaMusicas');
    };

    const handleGoToMedicoDetails = () => {
        setTelaAtual('detalhesMusicoterapeutaPaciente');
    };

    const handleSolicitarAgendamento = () => {
        setGlobalMessage('Solicitação de agendamento enviada com sucesso!');
        setTimeout(() => setGlobalMessage(null), 3000);
        // You could also navigate to a confirmation screen or a new screen here
        // For now, it just shows a global message.
    };

    // --- Web Audio API and Visualizer Logic ---

    // Function to draw the visualizer
    const animateVisualizer = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        if (!canvas || !analyser || !dataArray) {
            animationFrameRef.current = null; // Ensure loop stops if refs are gone
            return;
        }

        animationFrameRef.current = requestAnimationFrame(animateVisualizer);

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        analyser.getByteFrequencyData(dataArray); // Get frequency data

        // Clear canvas
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background

        const barWidth = (canvas.width / bufferLengthRef.current) * 2.5; // Adjusted width for better visualization
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLengthRef.current; i++) {
            barHeight = dataArray[i]; // Value from 0-255

            // Simple gradient or color based on height
            const hue = i / bufferLengthRef.current * 360; // Color based on frequency
            canvasCtx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            
            // Draw bars (from bottom up)
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1; // Spacing between bars
        }
    }, []);

    const handleStopMusicGlobal = useCallback(() => {
        if (audioSourceNodeRef.current) {
            audioSourceNodeRef.current.stop();
            audioSourceNodeRef.current.disconnect(); // Disconnect from all nodes
            audioSourceNodeRef.current = null;
        }
        // Stop animation frame
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setIsPlayingGlobally(false);
        setCurrentPlayingTrackGlobally(null);
        setPlaybackProgressGlobally(0);
        setElapsedTimeGlobally(0);
        playbackStartTimeRef.current = 0;
        pauseOffsetRef.current = 0;
        setGlobalMessage(null); // Clear any existing message
    }, []);

    const handlePlayMusicGlobal = useCallback(async (terapia: Musicoterapia, resumeFrom: number = 0) => {
        // Initialize AudioContext on user interaction
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // Stop any existing playback first
        if (audioSourceNodeRef.current) {
            audioSourceNodeRef.current.stop();
            audioSourceNodeRef.current.disconnect();
            audioSourceNodeRef.current = null;
        }
        // Stop any existing animation
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setCurrentPlayingTrackGlobally(terapia);
        setIsPlayingGlobally(true);

        try {
            // Load audio buffer if not already loaded or if it's a new track
            if (!audioBufferRef.current || audioBufferRef.current.duration === 0 || audioBufferRef.current.duration !== (terapia.duracaoMin * 60)) {
                 const response = await fetch(terapia.audioUrl);
                 const arrayBuffer = await response.arrayBuffer();
                 audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
            }

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;

            // Create and connect AnalyserNode
            if (!analyserRef.current) {
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.fftSize = 256; // Smaller FFT for faster processing, adjust as needed
                bufferLengthRef.current = analyserRef.current.frequencyBinCount; // Usually fftSize / 2
                dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
            }

            // Connect the source to the analyser, then analyser to destination
            source.connect(analyserRef.current);
            analyserRef.current.connect(audioContextRef.current.destination);

            source.start(0, resumeFrom); // Start from offset

            playbackStartTimeRef.current = audioContextRef.current.currentTime - resumeFrom;
            pauseOffsetRef.current = resumeFrom;

            audioSourceNodeRef.current = source;

            source.onended = () => {
                // Small delay to ensure the last progress update is 100%
                setTimeout(() => handleStopMusicGlobal(), 100);
            };

            // Start the visualizer animation
            animateVisualizer();

            setGlobalMessage(`Reproduzindo: ${terapia.titulo}`);
            setTimeout(() => setGlobalMessage(null), 3000);

        } catch (error) {
            console.error("Erro ao reproduzir áudio:", error);
            setGlobalMessage(`Erro ao reproduzir: ${terapia.titulo}`);
            handleStopMusicGlobal(); // Reset player on error
        }
    }, [handleStopMusicGlobal, animateVisualizer]);

    const handlePauseResumeMusicGlobal = useCallback(() => {
        if (!currentPlayingTrackGlobally || !audioContextRef.current) return;

        if (isPlayingGlobally) {
            // Pause: stop the source node and calculate pause offset
            if (audioSourceNodeRef.current) {
                audioSourceNodeRef.current.stop();
                audioSourceNodeRef.current.disconnect();
                audioSourceNodeRef.current = null;
            }
            pauseOffsetRef.current = audioContextRef.current.currentTime - playbackStartTimeRef.current;
            setIsPlayingGlobally(false);
            setGlobalMessage(`Pausado: ${currentPlayingTrackGlobally.titulo}`);
            setTimeout(() => setGlobalMessage(null), 3000);
            // Stop visualizer animation when paused
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        } else {
            // Resume: call play with the stored offset
            handlePlayMusicGlobal(currentPlayingTrackGlobally, pauseOffsetRef.current);
        }
    }, [isPlayingGlobally, currentPlayingTrackGlobally, handlePlayMusicGlobal]);


    // Effect to update visual progress bar (still using setInterval, but based on real AudioContext time)
    useEffect(() => {
        if (isPlayingGlobally && currentPlayingTrackGlobally && audioContextRef.current) {
            const totalSeconds = currentPlayingTrackGlobally.duracaoMin * 60;
            const updateInterval = 100; // ms

            const intervalId = setInterval(() => {
                // Ensure audioContextRef.current exists before accessing currentTime
                const elapsed = audioContextRef.current ? (audioContextRef.current.currentTime - playbackStartTimeRef.current) : 0;
                setElapsedTimeGlobally(elapsed);
                setPlaybackProgressGlobally((elapsed / totalSeconds) * 100);

                // Auto-stop when audio finishes based on elapsed time (redundant with onended, but as fallback)
                if (elapsed >= totalSeconds && animationFrameRef.current !== null) {
                     clearInterval(intervalId);
                     handleStopMusicGlobal();
                }
            }, updateInterval);

            return () => clearInterval(intervalId); // Cleanup interval
        } else {
            // Clear interval if not playing
            setPlaybackProgressGlobally((prev) => (isPlayingGlobally ? prev : 0)); // Reset progress if not playing
            setElapsedTimeGlobally((prev) => (isPlayingGlobally ? prev : 0));
        }
    }, [isPlayingGlobally, currentPlayingTrackGlobally, playbackStartTimeRef.current, handleStopMusicGlobal]);


    // Global cleanup for AudioContext when App unmounts
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 text-white font-sans flex flex-col">
            {/* Global Message Display */}
            <AnimatePresence>
                {globalMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600/80 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        {globalMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content based on telaAtual */}
            {(() => {
                switch (telaAtual) {
                    case 'login':
                        return (
                            <div className="flex-1 flex items-center justify-center p-4">
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
                                            Aplicativo de Musicoterapia
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="crm" className="text-white">Login do Profissional (CRM)</Label>
                                            <Input
                                                id="crm"
                                                type="text"
                                                value={crm}
                                                onChange={(e) => setCrm(e.target.value)}
                                                placeholder="Digite seu CRM"
                                                className={cn(
                                                    "bg-black/20 text-white border-sky-500/30",
                                                    "placeholder:text-gray-400 focus-visible:ring-sky-500",
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
                                                "w-full bg-gradient-to-r from-sky-600 to-blue-700",
                                                "text-white font-semibold py-3 rounded-full",
                                                "hover:from-sky-700 hover:to-blue-800",
                                                "transition-all duration-300 shadow-lg",
                                                loading && "opacity-70 cursor-not-allowed"
                                            )}
                                            disabled={loading}
                                        >
                                            {loading ? 'Carregando...' : 'Entrar como Profissional'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setTelaAtual('loginPaciente')}
                                            className="w-full text-gray-400 hover:text-white"
                                        >
                                            Entrar como Paciente
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    case 'loginPaciente':
                        return (
                            <LoginPacienteScreen
                                onLoginPaciente={handleLoginPaciente}
                                onVoltar={handleVoltar}
                            />
                        );
                    case 'home':
                        return (
                            <HomeScreen
                                medico={medico}
                                pacientes={pacientes}
                                onLogout={handleLogout}
                                onSelectPaciente={handleSelectPaciente}
                                onAgendarSessao={handleAgendarSessao}
                                onAnaliseProgressoIA={handleAnaliseProgressoIA} // Pass new prop
                            />
                        );
                    case 'homePaciente':
                        if (!currentPatient) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">Nenhum paciente logado.</p>
                                </div>
                            );
                        }
                        return (
                            <HomePacienteScreen
                                paciente={currentPatient}
                                medico={medico} // Assuming one main medico for now
                                onLogout={handleLogout}
                                onGoToMusicLibrary={handleGoToMusicLibrary}
                                onGoToMedicoDetails={handleGoToMedicoDetails} // New prop
                                onGoToDiarioEmocoes={handleGoToDiarioEmocoes} // New prop
                            />
                        );
                    case 'detalhesMusicoterapeutaPaciente': // New screen
                        return (
                            <DetalhesMusicoterapeutaPaciente
                                medico={medico}
                                onVoltar={handleVoltar}
                                onSolicitarAgendamento={handleSolicitarAgendamento}
                            />
                        );
                    case 'bibliotecaMusicas':
                        return (
                            <BibliotecaMusicasScreen
                                onVoltar={handleVoltar}
                                onPlayMusic={handlePlayMusicGlobal}
                                isPlaying={isPlayingGlobally}
                                currentPlayingTrack={currentPlayingTrackGlobally}
                                playbackProgress={playbackProgressGlobally}
                                elapsedTime={elapsedTimeGlobally}
                            />
                        );
                    case 'detalhesPaciente':
                        const pacienteSelecionado = pacientes.find(p => p.id === selectedPacienteId);
                        if (!pacienteSelecionado) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">Paciente não encontrado.</p>
                                </div>
                            );
                        }
                        return (
                            <DetalhesPaciente
                                paciente={pacienteSelecionado}
                                onVoltar={handleVoltar}
                                onAgendarSessao={handleAgendarSessao}
                                sessoes={sessoes}
                                onAnaliseProgressoIA={handleAnaliseProgressoIA} // Pass new prop
                            />
                        );
                    case 'analiseProgressoIA': // New screen
                        const pacienteParaAnalise = pacientes.find(p => p.id === selectedPacienteId);
                        if (!pacienteParaAnalise) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">Paciente não encontrado para análise.</p>
                                </div>
                            );
                        }
                        return (
                            <AnaliseProgressoIAScreen
                                paciente={pacienteParaAnalise}
                                sessoes={sessoes}
                                onVoltar={handleVoltar}
                            />
                        );
                    case 'diarioEmocoes': // New screen
                        if (!currentPatient) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">Nenhum paciente logado para o diário de emoções.</p>
                                </div>
                            );
                        }
                        return (
                            <DiarioEmocoesScreen
                                paciente={currentPatient}
                                onVoltar={handleVoltar}
                            />
                        );
                    case 'agendarSessao':
                        if (!selectedPacienteId) {
                            return (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500">Nenhum paciente selecionado para agendar a sessão.</p>
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
                                <p className="text-red-500">Tela não encontrada.</p>
                            </div>
                        );
                }
            })()}

            {/* Player de Música Global Fixo */}
            <AnimatePresence>
                {currentPlayingTrackGlobally && ( // Render only if a track is set (playing or paused)
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm p-4 border-t border-white/10 flex items-center justify-between z-40 flex-wrap"
                    >
                        <div className="flex-1 mr-4 min-w-[150px]">
                            <p className="text-sm font-semibold text-white truncate">
                                {isPlayingGlobally ? 'Reproduzindo' : 'Pausado'}: {currentPlayingTrackGlobally.titulo}
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${playbackProgressGlobally}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>{formatTime(elapsedTimeGlobally)}</span>
                                <span>{formatTime(currentPlayingTrackGlobally.duracaoMin * 60)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button
                                onClick={handlePauseResumeMusicGlobal}
                                className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 border-cyan-500/30"
                            >
                                {isPlayingGlobally ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            <Button onClick={handleStopMusicGlobal} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border-red-500/30">
                                <StopCircle className="w-5 h-5" />
                            </Button>
                        </div>
                        {/* Canvas para Visualização do Áudio */}
                        <canvas ref={canvasRef} width={150} height={40} className="ml-4 bg-gray-900/50 rounded-md border border-gray-700 hidden sm:block" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;