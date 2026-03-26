// 问题池 - 优先从数据库API加载，回退到本地版本
import { DiscoveryMode, QuestionPoolItem } from "../types";

// 导出API版本（主要使用）
export { INITIAL_QUESTION_POOL, initializeQuestionPool, getQuestionPoolByMode, getRandomQuestion, clearCache } from "./questions-api";

// 也导出本地版本（备用）
export { INITIAL_QUESTION_POOL as LOCAL_QUESTION_POOL } from "./questions-local";
