import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});


io.use(async (socket, next) => {

    try {
        console.log('Socket connection attempt:', {
            auth: socket.handshake.auth,
            query: socket.handshake.query,
            headers: socket.handshake.headers
        });

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!projectId) {
            console.log('No projectId provided');
            return next(new Error('Project ID is required'));
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            console.log('Invalid projectId:', projectId);
            return next(new Error('Invalid projectId'));
        }

        if (!token) {
            console.log('No token provided');
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully for user:', decoded.email);

        socket.project = await projectModel.findById(projectId);
        if (!socket.project) {
            console.log('Project not found:', projectId);
            return next(new Error('Project not found'));
        }

        socket.user = decoded;
        console.log('Socket authentication successful');
        next();

    } catch (error) {
        console.log('Socket authentication error:', error.message);
        next(error);
    }

})


io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()

    console.log(`User ${socket.user.email} connected to project ${socket.roomId}`);
    socket.join(socket.roomId);

    socket.on('project-message', async data => {
        console.log('Received message:', data);
        
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');
        
        // Broadcast message to all users in the room
        socket.broadcast.to(socket.roomId).emit('project-message', data);
        console.log('Message broadcasted to room:', socket.roomId);

        if (aiIsPresentInMessage) {
            console.log('AI message detected, processing...');
            
            try {
                const prompt = message.replace('@ai', '').trim();
                console.log('AI prompt:', prompt);
                
                const result = await generateResult(prompt);
                console.log('AI response generated');

                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
                console.log('AI response sent to room:', socket.roomId);
            } catch (error) {
                console.error('AI generation error:', error);
                io.to(socket.roomId).emit('project-message', {
                    message: 'Sorry, I encountered an error while processing your request.',
                    sender: {
                        _id: 'ai',
                        email: 'AI'
                    }
                });
            }
            return;
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.user.email} disconnected from project ${socket.roomId}`);
        socket.leave(socket.roomId);
    });
});




server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})