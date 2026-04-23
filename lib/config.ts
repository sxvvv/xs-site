/*  lib/config.ts
    所有"个人信息"集中在这里,方便你改。 */

export const SITE = {
  handle: "suxin",
  name: "Su Xin",
  role: "incoming AI infra engineer · still learning",
  location: "~/cn",
  status: "online",
  tagline:
    "即将从校园走进工业界,做国产 GPU 方向的 AI infra。在那之前,把基础慢慢补齐 —— 这里是过程的脚印。",
  email: "suxin4726@gmail.com",
  github: "https://github.com/sxvvv",
  twitter: "",
  interests: [
    "ai-infra",
    "gpu",
    "cuda",
    "llm",
    "mlsys",
    "operating-systems",
    "distributed-systems",
  ],
  about: [
    "你好,我是 Su Xin。CS 方向硕士在读,即将毕业,下一站去做国产 GPU 相关的 AI infra 工程。",
    "目前的状态是「入门」—— 从训练、推理优化,到并行策略、显存管理、底层调度,把缺的拼图一块一块补上。",
    "这个站点是我的公开笔记本:把读过的论文、看过的源码、踩过的坑整理成可以被搜索、被引用、被未来自己回看的样子。慢一点也没关系,持续就是答案。",
    "— 还在路上。",
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

// tag → 中文分类名,用于 blog 页按系列分组
export const TAG_CATEGORIES: Record<string, string> = {
  os: "操作系统",
  network: "网络",
  gpu: "GPU & CUDA",
  cuda: "GPU & CUDA",
  llm: "LLM",
  mlsys: "MLSys",
  distributed: "分布式系统",
};

// 分类在 blog 页面的显示顺序(未列出的排在后面,「其他」永远最末)
export const CATEGORY_ORDER = [
  "操作系统",
  "网络",
  "GPU & CUDA",
  "LLM",
  "MLSys",
  "分布式系统",
];
