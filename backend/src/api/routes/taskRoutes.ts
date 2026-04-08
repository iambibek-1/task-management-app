import { Router, Request, Response } from "express";
import { TaskController } from "../controllers";
import { exceptionHandler, Guard } from "../../middlewares";


const taskRoutes = Router();

// All task routes require authentication
taskRoutes.use(Guard.authenticate);

/**
 * @swagger
 * /task:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
taskRoutes.get('/',exceptionHandler(TaskController.getTask));

/**
 * @swagger
 * /task:
 *   post:
 *     summary: Create a new task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [completed, inProgress, incomplete]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assignedTo:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 */
taskRoutes.post('/', Guard.requireAdmin, exceptionHandler(TaskController.postTask));

/**
 * @swagger
 * /task/priority/{priority}:
 *   get:
 *     summary: Get tasks by priority
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: priority
 *         required: true
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Task priority
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
taskRoutes.get('/priority/:priority',exceptionHandler(TaskController.getTaskByPriority));

/**
 * @swagger
 * /task/{id}/complete:
 *   patch:
 *     summary: Mark a task as completed
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeSpentHours:
 *                 type: number
 *                 description: Hours spent on the task
 *               notes:
 *                 type: string
 *                 description: Completion notes
 *     responses:
 *       200:
 *         description: Task marked as completed successfully
 */
taskRoutes.patch('/:id/complete', exceptionHandler(TaskController.completeTask));

/**
 * @swagger
 * /task/test-email:
 *   post:
 *     summary: Send a test email to verify email service configuration
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       500:
 *         description: Failed to send test email
 */
taskRoutes.post('/test-email', exceptionHandler(TaskController.testEmailService));

/**
 * @swagger
 * /task/user-recommendations:
 *   post:
 *     summary: Get user recommendations for task assignment using WUSS algorithm
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               estimatedHours:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User recommendations generated successfully
 */
taskRoutes.post('/user-recommendations', Guard.requireAdmin, exceptionHandler(TaskController.getUserRecommendations));

/**
 * @swagger
 * /task/recommendations:
 *   post:
 *     summary: Get task creation recommendations
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               estimatedHours:
 *                 type: number
 *               assignedUserIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Task recommendations generated successfully
 */
taskRoutes.post('/recommendations', exceptionHandler(TaskController.getTaskRecommendations));

/**
 * @swagger
 * /task/analytics:
 *   get:
 *     summary: Get task analytics dashboard data
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task analytics retrieved successfully
 */
taskRoutes.get('/analytics', exceptionHandler(TaskController.getTaskAnalytics));

/**
 * @swagger
 * /task/completion-records:
 *   get:
 *     summary: Get task completion records
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: taskId
 *         schema:
 *           type: integer
 *         description: Filter by task ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Task completion records retrieved successfully
 */
taskRoutes.get('/completion-records', exceptionHandler(TaskController.getTaskCompletionRecords));

/**
 * @swagger
 * /task/user-analytics/{userId}:
 *   get:
 *     summary: Get user performance analytics
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         description: User ID (optional, defaults to current user)
 *     responses:
 *       200:
 *         description: User performance analytics retrieved successfully
 */
taskRoutes.get('/user-analytics/:userId?', exceptionHandler(TaskController.getUserPerformanceAnalytics));

/**
 * @swagger
 * /task/{id}:
 *   put:
 *     summary: Update a task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [completed, inProgress, incomplete]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assignedTo:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
taskRoutes.put('/:id', Guard.requireAdmin, exceptionHandler(TaskController.updateTask));

/**
 * @swagger
 * /task/{id}/status:
 *   patch:
 *     summary: Update task status (Users can update their assigned tasks)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [incomplete, inProgress, completed]
 *                 description: New task status
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       403:
 *         description: Access denied - not assigned to this task
 *       404:
 *         description: Task not found
 */
taskRoutes.patch('/:id/status', Guard.authenticate, exceptionHandler(TaskController.updateTaskStatus));

/**
 * @swagger
 * /task/{id}:
 *   delete:
 *     summary: Delete a task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
taskRoutes.delete('/:id', Guard.requireAdmin, exceptionHandler(TaskController.deleteTask));

export default taskRoutes;