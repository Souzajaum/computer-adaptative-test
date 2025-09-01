import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useEffect, useState, useCallback } from "react";
import { loginAnon, supabase } from "../../../supabaseClient";
import { Button } from "../ui/button";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const Quiz = () => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [userId, setUserId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [theta, setTheta] = useState(0.0);

  // 🔹 Busca próxima questão adaptativa
  const fetchQuestion = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/next-question`, {
        params: { user_id: userId },
      });

      // Se backend retornar teste concluído
      if (res.data.finished) {
        setIsFinished(true);
        setQuestion(null);
        setTheta(res.data.theta || theta);
      } else if (res.data.question) {
        setQuestion(res.data.question);
        setTheta(res.data.theta || theta);
        setAnswer("");
      } else {
        setQuestion(null);
      }
    } catch (err) {
      console.error("Erro ao buscar questão:", err);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [userId, theta]);

  // 🔹 Inicialização e login
  useEffect(() => {
    const init = async () => {
      const session = await supabase.auth.getSession();
      let user = session?.data?.session?.user;

      if (!user) {
        const login = await loginAnon();
        setUserId(login?.user?.id || login); // loginAnon retorna objeto
      } else {
        setUserId(user.id);
      }
    };

    init();
  }, []);

  // 🔹 Busca primeira questão quando userId definido
  useEffect(() => {
    if (userId) fetchQuestion();
  }, [userId, fetchQuestion]);

  const handleSelect = (option) => setAnswer(option);

  const handleNext = async () => {
    if (!answer) {
      alert("Selecione uma alternativa antes de continuar.");
      return;
    }

    if (!question) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/submit-answer`,
        {
          user_id: userId,
          question_id: question.id,
          answer,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.correct) setCorrectAnswers((prev) => prev + 1);
      setTheta(res.data.theta || theta);

      await fetchQuestion();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      {loading && !question ? (
        <p>Carregando questão...</p>
      ) : isFinished ? (
        <Card className="w-full max-w-xl mx-auto text-center">
          <CardHeader>
            <CardTitle>Parabéns!</CardTitle>
            <CardDescription>Você concluiu o quiz.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">
              Você acertou <strong>{correctAnswers}</strong> questões.
            </p>
            <p className="text-sm text-gray-500">
              Seu nível estimado (θ): <strong>{theta.toFixed(2)}</strong>
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Reiniciar</Button>
          </CardFooter>
        </Card>
      ) : question ? (
        <Card className="w-full max-w-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">{question.stem}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              name={`question-${question.id}`}
              value={answer}
              onValueChange={handleSelect}
            >
              {question.options ? (
                Object.entries(question.options).map(([letter, text]) => (
                  <div className="flex items-center gap-3 py-2" key={letter}>
                    <RadioGroupItem
                      value={letter}
                      id={`${question.id}-${letter}`}
                    />
                    <Label htmlFor={`${question.id}-${letter}`}>
                      <strong>{letter})</strong> {text}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  ⚠️ Nenhuma opção disponível
                </p>
              )}
            </RadioGroup>

            <p className="mt-4 text-sm text-gray-500">
              <strong>θ atual:</strong> {theta.toFixed(2)}
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext}>
              {answer ? "Próxima" : "Selecione uma opção"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <p>Nenhuma questão disponível.</p>
      )}
    </div>
  );
};

export default Quiz;
