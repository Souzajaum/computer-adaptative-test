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
import { Button } from "../ui/button";
import { supabase } from "../../../supabaseClient";
import axios from "axios";

const API_URL = "https://cat-quiz-app-2.onrender.com/api";
const TOTAL_QUESTIONS = 20;

const Quiz = ({ onFinish }) => {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [userId, setUserId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [theta, setTheta] = useState(0.0);
  const [questionNumber, setQuestionNumber] = useState(0);

  // Função para buscar a próxima questão
  const fetchQuestion = useCallback(
    async (uid = null) => {
      const id = uid || userId;
      if (!id) return;

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/next-question`, {
          params: { user_id: id },
        });

        if (res.data.finished || questionNumber >= TOTAL_QUESTIONS) {
          setIsFinished(true);
          setQuestion(null);
          if (res.data.theta !== undefined) setTheta(res.data.theta);
        } else if (res.data.question) {
          setQuestion(res.data.question);
          setAnswer("");
          setIsFinished(false);
          if (res.data.theta !== undefined) setTheta(res.data.theta);
        } else {
          setQuestion(null);
        }
      } catch (err) {
        console.error("Erro ao buscar questão:", err);
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    },
    [userId, questionNumber]
  );

  // Inicializa o quiz assim que o usuário estiver disponível
  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          const currentUserId = user.id;
          setUserId(currentUserId);

          // Cria ou reinicia o quiz no backend
          await axios.post(
            `${API_URL}/start-quiz`,
            { user_id: currentUserId },
            { headers: { "Content-Type": "application/json" } }
          );

          // Busca a primeira questão, passando o userId direto
          await fetchQuestion(currentUserId);
        }
      } catch (err) {
        console.error("Erro ao iniciar quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [fetchQuestion]);

  const handleSelect = (option) => setAnswer(option);

  const handleNext = async () => {
    if (!answer) return alert("Selecione uma alternativa antes de continuar.");
    if (!question) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/submit-answer`,
        { user_id: userId, question_id: question.id, answer },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.correct) setCorrectAnswers((prev) => prev + 1);
      if (res.data.theta !== undefined) setTheta(res.data.theta);

      setQuestionNumber((prev) => prev + 1);

      await fetchQuestion();
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
    } finally {
      setLoading(false);
    }
  };

  const finishQuiz = () => {
    setIsFinished(false);
    setCorrectAnswers(0);
    setTheta(0.0);
    setAnswer("");
    setQuestion(null);
    setQuestionNumber(0);

    if (onFinish) onFinish();
  };

  const progressPercent = Math.min(
    (questionNumber / TOTAL_QUESTIONS) * 100,
    100
  );

  return (
    <div className="flex justify-center w-full mt-4">
      <div className="w-full max-w-3xl">
        {isFinished ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
            <Card className="w-full max-w-md bg-white text-gray-900 shadow-lg">
              <CardHeader className="text-black rounded-t-lg text-center">
                <CardTitle>🎉 Teste Finalizado!</CardTitle>
                <CardDescription className="text-black">
                  Obrigado por participar do teste adaptativo.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 text-center">
                <p className="text-lg font-medium mb-4">
                  Você acertou <strong>{correctAnswers}</strong> questões.
                </p>
                <p className="text-sm">
                  Seu nível estimado (θ): <strong>{theta.toFixed(2)}</strong>
                </p>
              </CardContent>

              <CardFooter className="flex justify-center">
                <Button
                  onClick={finishQuiz}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Finalizar
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : question ? (
          <Card className="w-full bg-white text-gray-900 shadow-lg">
            <CardHeader className="text-black rounded-t-lg text-center">
              <CardTitle>Teste Adaptativo</CardTitle>
              <CardDescription className="text-center text-black">
                Questão {questionNumber + 1} de {TOTAL_QUESTIONS}
              </CardDescription>
            </CardHeader>

            <div className="h-2 bg-gray-300">
              <div
                className="h-2 bg-blue-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-center">
                {question.stem}
              </h2>
              <RadioGroup
                name={`question-${question.id}`}
                value={answer}
                onValueChange={handleSelect}
              >
                {question.options &&
                  Object.entries(question.options).map(([letter, text]) => (
                    <div
                      className="flex items-center gap-3 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                      key={letter}
                    >
                      <RadioGroupItem
                        value={letter}
                        id={`${question.id}-${letter}`}
                      />
                      <Label
                        htmlFor={`${question.id}-${letter}`}
                        className="cursor-pointer"
                      >
                        <strong>{letter})</strong> {text}
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
            </CardContent>

            <CardFooter className="flex justify-between p-4">
              <p className="text-sm text-gray-600">
                θ atual: <strong>{theta.toFixed(2)}</strong>
              </p>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {loading ? "Carregando..." : "Próxima"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <p className="text-center text-gray-700 mt-8">
            {loading ? "Carregando questões..." : "Nenhuma questão disponível."}
          </p>
        )}
      </div>
    </div>
  );
};

export default Quiz;
