"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.speechRecScript = void 0;
const speechRecScript = exports.speechRecScript = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Speech Recognition Script</title>
  </head>
  <body>
    <script>
      let finalizedTranscript = "";
      let transcriptResult = "";
      let isListening = false;

      // Check for browser compatibility
      window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      window.SpeechGrammarList =
        window.SpeechGrammarList || window.webkitSpeechGrammarList;
      window.SpeechRecognitionEvent =
        window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

      if ("SpeechRecognition" in window) {
        let recognition = new SpeechRecognition();
        recognition.interimResults = true; // Get interim results

        let isManualStop = false;

        recognition.addEventListener("start", (event) => {
          if (!isListening) {
            isListening = true;
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "SpeechRecognitionStarted",
                data: {},
              })
            );
          }
        });

        recognition.addEventListener("result", (event) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalizedTranscript += " " + event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          transcriptResult = finalizedTranscript + " " + interimTranscript;

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "SpeechRecognitionRealTimeResult",
              data: transcriptResult,
            })
          );
        });

        recognition.addEventListener("end", () => {
          // If the speech recognition is ended because the speech rec engine decided that
          // the user finishes speaking (e.g., user kept silent for a few seconds), we restart
          // the speech rec process
          if (!isManualStop) {
            recognition.start();
          } else {
            isListening = false;

            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "SpeechRecognitionEnd",
                data: transcriptResult,
              })
            );
          }
        });

        recognition.addEventListener("error", (event) => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: "SpeechRecognitionError",
              data: {
                code: event.error,
                errorMessage: event.message,
              },
            })
          );
        });

        window.handleNativeEvent = function (message) {
          switch (message.type) {
            case "StartSpeechRecognition":
              isManualStop = false;
              isListening = false; // this will be set to true in start event listener
              finalizedTranscript = "";
              transcriptResult = "";

              recognition.lang = message.data.language;
              recognition.start();
              break;

            case "StopSpeechRecognition":
              isManualStop = true;
              recognition.stop();

              break;

            case "CancelSpeechRecognition":
              isManualStop = true;
              recognition.abort();

              break;

            default:
              console.error("Unhandled WebView message type: ", message.type);
              break;
          }
        };
      }
    </script>
  </body>
</html>
`;
//# sourceMappingURL=speechRecScript.js.map