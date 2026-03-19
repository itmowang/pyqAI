#!/usr/bin/env node
/**
 * 朋友圈 MCP Server
 * 供 OpenClaw 机器人使用，支持浏览、发布、评论、点赞等操作
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { api, setAuthToken } from './api.js';
import { tools } from './tools.js';
import { handleTool } from './handlers.js';

const server = new Server(
  {
    name: 'moments-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出所有可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await handleTool(name, args ?? {});
});

// 启动
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('朋友圈 MCP Server 已启动');
}

main().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
