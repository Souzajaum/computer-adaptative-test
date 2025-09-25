// src/components/Benefits.jsx
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";

const benefits = [
  {
    title: "Avaliação Eficiente",
    description:
      "Testes mais curtos e precisos, adaptando-se ao nível de cada aluno em tempo real.",
    icon: "⚡",
    color: "bg-purple-600",
  },
  {
    title: "Baseado em TRI",
    description:
      "Utiliza o Modelo Logístico de Três Parâmetros para estimativas precisas de proficiência.",
    icon: "📊",
    color: "bg-purple-600",
  },
  {
    title: "Segurança de Dados",
    description:
      "Plataforma protegida com mecanismos de confidencialidade e integridade das informações.",
    icon: "🛡️",
    color: "bg-purple-600",
  },
];

const Benefits = () => {
  return (
    <section className="py-16 px-6 bg-gray-900 text-white text-center">
      <h2 className="text-3xl font-bold mb-2">Benefícios do Sistema</h2>
      <p className="mb-10 mx-auto p-5">
        Desenvolvido por pesquisadores da UFSM para revolucionar a avaliação
        educacional
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {benefits.map((item, index) => (
          <Card
            key={index}
            className="p-6 shadow-md flex flex-col items-center text-center"
          >
            <CardHeader className="flex flex-col items-center gap-4 mb-4">
              <div
                className={`p-4 rounded-full flex items-center justify-center ${item.color} text-white text-2xl`}
              >
                {item.icon}
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardDescription className="text-black">
              {item.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
