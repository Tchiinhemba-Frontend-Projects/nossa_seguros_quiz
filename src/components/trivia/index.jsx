import "./main.scss";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { useSound } from "use-sound";

import Levels from "../levels";
import CircularTimer from "../circularTimer/circularTimer"; // Importa o temporizador circular

import { levels } from "../../data/levels";

import nossa_logo from "../../assets/svg/nossa_logo.svg";

import play from "../../assets/sounds/gaming.mp3";
import correct from "../../assets/sounds/correct.mp3";
import wrong from "../../assets/sounds/wrong.mp3";

function Trivia({ data, setStop, questionNumber, setQuestionNumber }) {

  const navigate = useNavigate();
  const timerRef = useRef(null);
  const duration = 30; // Defina a duração do temporizador em segundos

  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showLevel, setShowLevel] = useState(false);
  const [className, setClassName] = useState("_tr_answer");
  const [isBlocked, setIsBlocked] = useState(false);

  const [letsPlay, { stop: stopLetsPlay }] = useSound(play, { loop: true });
  const [correctAnswerSound] = useSound(correct);
  const [wrongAnswerSound] = useSound(wrong);



  useEffect(() => {
    letsPlay();
    return () => stopLetsPlay();
  }, [letsPlay, stopLetsPlay]);

  useEffect(() => {
    setQuestion(data[questionNumber - 1]);
    if (timerRef.current) {
      timerRef.current.startTimer();
    }
  }, [data, questionNumber]);

  const handleTimerComplete = () => {
    stopLetsPlay();
    navigate("/lose");
    setStop(true);
  };

  const delay = (duration, callback) => {
    setTimeout(() => {
      callback();
    }, duration);
  };

  const handleContinue = () => {
    setShowLevel(false);
    setQuestionNumber((prev) => prev + 1);
    if (timerRef.current) {
      timerRef.current.startTimer();
    }
  };

  const handleQuit = () => {
    stopLetsPlay();
    const gameLevel = getGameLevel(questionNumber);
    navigate("/win", { state: { message: `Concluiu o ${gameLevel}, venha buscar o seu prémio.` } });
    setStop(true);
  };

  function getGameLevel(questionNumber) {
    if (questionNumber <= 4) {
      return "Nível 1";
    } else if (questionNumber <= 8) {
      return "Nível 2";
    } else {
      return "Nível 3";
    }
  }

  function handleClick(answer) {
    if (isBlocked) return;

    if (timerRef.current) {
      timerRef.current.stopTimer(); // Pare o temporizador
    }

    setIsBlocked(true);
    setSelectedAnswer(answer);
    setClassName("_tr_answer active");

    delay(3000, () =>
      setClassName(
        answer.correct ? "_tr_answer _tr_correct" : "_tr_answer _tr_wrong"
      )
    );

    delay(6000, () => {
      if (answer.correct) {
        if (questionNumber === data.length) {
          correctAnswerSound();
          stopLetsPlay();
          navigate("/win", { state: { message: "Você venceu o Jogo" } });
          setStop(true);
          setIsBlocked(false);
          setClassName("");
        } else {
          correctAnswerSound();
          delay(3000, () => {
            setSelectedAnswer(null);
            setIsBlocked(false);

            // Mostrar o nível a cada mudança de nível
            if (questionNumber === 4 || questionNumber === 8) {
              setShowLevel(true);
            } else {
              setQuestionNumber((prev) => prev + 1);
              if (timerRef.current) {
                timerRef.current.startTimer();
              }
            }
          });
        }
      } else {
        wrongAnswerSound();
        stopLetsPlay();
        setSelectedAnswer(null);
        navigate("/lose");
        setStop(true);
      }
    });
  }

  return (
    <div>
      {showLevel ? (
        <Levels
          questionNumber={questionNumber}
          onContinue={handleContinue}
          onQuit={handleQuit}
        />
      ) : (
        <>
          <div className="_tr_header_game">
            <img src={nossa_logo} alt="" className="_tr_logo" />
            <CircularTimer ref={timerRef} duration={duration} onComplete={handleTimerComplete} />
          </div>
          <div className="_tr_display_container">
            <span className="_tr_question">{question?.question}</span>
          </div>
          <div className="_tr_answers_container">
            {question?.answers.map((answer, index) => (
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={selectedAnswer === answer ? className : "_tr_answer"}
                key={index}
                onClick={() => handleClick(answer)}
              >
                <p>{answer.text}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Trivia;
