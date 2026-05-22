import api from './axios';


export const executionService = {


// POST /api/rooms/{roomId}/execute
// Sends code to backend -> Piston API -> returns output


    execute: (roomId, sourceCode, language, stdin = "") => {
        console.log({
            roomId,
            sourceCode,
            language,
            stdin
        });

        return api.post(`/rooms/${roomId}/execute`, {
            sourceCode, // the code string
            language, // e.g. "python", "javascript"
            stdin, // optional input for the program
        });
    },

// GET /api/rooms/{roomId}/executions
// Returns last 10 executions for the History page


getHistory: (roomId) =>
api.get(`/rooms/${roomId}/executions`),
};
