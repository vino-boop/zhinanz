// 问题池 - 从后端API获取
// 这个文件是主入口，会自动从API加载数据

import { DiscoveryMode, QuestionPoolItem } from "../types";

// 导入API版本（会自动处理API/本地数据的切换）
export { INITIAL_QUESTION_POOL, initializeQuestionPool, getQuestionPoolByMode, getRandomQuestion } from "./questions-api";

// 为了兼容性，也导出本地版本
export { INITIAL_QUESTION_POOL as LOCAL_QUESTION_POOL } from "./questions-local";
