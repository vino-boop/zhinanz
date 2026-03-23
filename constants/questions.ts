// 问题池 - 使用本地版本（避免后端API超时）
import { DiscoveryMode, QuestionPoolItem } from "../types";

// 使用本地问题池
export { INITIAL_QUESTION_POOL, initializeQuestionPool, getQuestionPoolByMode, getRandomQuestion } from "./questions-local";

// 也导出API版本（备用）
export { INITIAL_QUESTION_POOL as LOCAL_QUESTION_POOL } from "./questions-local";
