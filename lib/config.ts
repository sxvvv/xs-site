/*  lib/config.ts
    所有"个人信息"集中在这里,方便你改。 */

export const SITE = {
  handle: "suxin",
  name: "Su Xin",
  role: "learning AI infra · notes · accumulation",
  location: "~/earth/asia",
  status: "online",
  tagline: "正在学习 AI infra,把读到的、写过的、踩过的坑慢慢攒下来。",
  email: "suxin4726@gmail.com",
  github: "https://github.com/sxvvv",
  twitter: "https://twitter.com/yourname",
  interests: ["ai-infra", "operating-systems", "llm", "gpu", "distributed-systems", "mlsys", "cuda"],
  about: [
    "你好,我是 Su Xin。目前正在学习 AI infra 的知识 —— 从模型训练、推理优化,到分布式系统、GPU 调度,一点一点积累。",
    "这个站点是我的公开笔记本。把读过的论文、看过的源码、做过的实验整理成可以被搜索、被引用、被未来的我自己回看的形式。",
    "— 还在路上,欢迎一起交流。",
  ],
  projects: [
    {
      name: "os-notes",
      tag: "WIP",
      status: "active",
      stack: ["Linux", "xv6", "OSTEP"],
      desc: "操作系统学习笔记:进程、内存、文件系统、并发原语。",
      stars: 0,
      url: "https://github.com/sxvvv",
    },
    {
      name: "ai-infra-notes",
      tag: "WIP",
      status: "active",
      stack: ["LLM", "GPU", "MLSys"],
      desc: "AI infra 学习笔记:训练、推理优化、并行策略、显存管理。",
      stars: 0,
      url: "https://github.com/sxvvv",
    },
    {
      name: "paper-reading",
      tag: "rolling",
      status: "active",
      stack: ["LLM", "MLSys"],
      desc: "LLM / MLSys 方向的论文阅读笔记与复现。",
      stars: 0,
      url: "https://github.com/sxvvv",
    },
  ],
} as const;
