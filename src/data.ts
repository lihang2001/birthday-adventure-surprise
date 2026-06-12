export type SceneId =
  | "cover"
  | "firstBattle"
  | "firstGift"
  | "collectHearts"
  | "secondGift"
  | "memories"
  | "bossBattle"
  | "fakeEnding"
  | "finalGift";

export interface BattleText {
  id: "first" | "boss";
  eyebrow: string;
  title: string;
  subtitle: string;
  hpLabel: string;
  attackLabel: string;
  hp: number;
  damage: number;
  lines: string[];
  defeatedText: string;
  unlockedText: string;
  continueText: string;
}

export interface GiftImage {
  src: string;
  alt: string;
  label: string;
  type?: "image" | "video";
}

export interface GiftReward {
  eyebrow: string;
  lockedTitle: string;
  openedTitle: string;
  closedText: string;
  item: string;
  description: string;
  images: GiftImage[];
  continueText: string;
}

export interface Memory {
  date: string;
  title: string;
  images: GiftImage[];
  diary: string;
}

export interface CollectAvatar {
  src: string;
  alt: string;
}

export interface CollectLevelText {
  eyebrow: string;
  title: string;
  subtitle: string;
  hint: string;
  lifeLabel: string;
  collectedLabel: string;
  playerAvatars: CollectAvatar[];
  goodItems: string[];
  badItems: string[];
  target: number;
  lives: number;
  completeText: string;
  continueText: string;
}

export const sceneLabels: Record<SceneId, string> = {
  cover: "开始",
  firstBattle: "小怪",
  firstGift: "礼物",
  collectHearts: "收集",
  secondGift: "礼物",
  memories: "相册",
  bossBattle: "Boss",
  fakeEnding: "结尾",
  finalGift: "大奖",
};

export const coverText = {
  badge: "Birthday Quest",
  title: "今天的小寿星，请开始冒险",
  subtitle: "前面有一点点小怪，但礼物也在等你。",
  startButton: "开始游戏",
  avoidButton: "不要开始",
  avoidTips: [
    "今天不能退出哦",
    "礼物还没出现",
    "小寿星必须继续前进",
    "还是点开始吧",
  ],
};

export type CoverText = typeof coverText;

export const firstBattle: BattleText = {
  id: "first",
  eyebrow: "Level 01",
  title: "第一关：打败小 Boss",
  subtitle: "它守着第一份小礼物，轻轻点它就好。",
  hpLabel: "小 Boss HP",
  attackLabel: "攻击紫色独眼小 Boss",
  hp: 120,
  damage: 10,
  lines: [
    "就这点力气呀？",
    "嘿嘿，打不到重点",
    "哎哟，还挺认真",
    "等等，别真打赢了",
  ],
  defeatedText: "成功打败第一只小怪，获得一个礼盒。",
  unlockedText: "礼盒掉出来了",
  continueText: "打开礼盒",
};

export const firstGift: GiftReward = {
  eyebrow: "Reward 01",
  lockedTitle: "有一个礼盒掉出来了",
  openedTitle: "第一个礼物公开",
  closedText: "礼盒还没打开，先不要偷看。",
  item: "泡泡玛特盲盒一对",
  description: "这只是第一份小礼物，后面还有。",
  images: [
    {
      src: "/gifts/popmart1.jpg",
      alt: "泡泡玛特盲盒 1",
      label: "popmart1.jpg",
    },
    {
      src: "/gifts/popmart2.jpg",
      alt: "泡泡玛特盲盒 2",
      label: "popmart2.jpg",
    },
  ],
  continueText: "继续冒险",
};

export const collectLevel: CollectLevelText = {
  eyebrow: "Level 02",
  title: "第二关：躲开坏东西并收集好运",
  subtitle: "拖动小角色移动，收集 12 件好运的事情就能解锁相册。",
  hint: "慢慢来，避开霉运和坏情绪，看到好运就靠近它。",
  lifeLabel: "生命值",
  collectedLabel: "好运",
  playerAvatars: [
    {
      src: "/avatars/collect-avatar-1.png",
      alt: "拿着花的 Q 版头像",
    },
    {
      src: "/avatars/collect-avatar-2.png",
      alt: "戴帽子的 Q 版头像",
    },
    {
      src: "/avatars/collect-avatar-3.png",
      alt: "戴眼镜的 Q 版头像",
    },
    {
      src: "/avatars/collect-avatar-4.png",
      alt: "眨眼拍照的 Q 版头像",
    },
  ],
  goodItems: [
    "开心",
    "顺利",
    "好眠",
    "美食",
    "暴富",
    "被爱",
    "好消息",
    "小惊喜",
    "轻松",
    "好运",
  ],
  badItems: ["霉运", "烦恼", "焦虑", "内耗", "坏情绪", "小倒霉"],
  target: 12,
  lives: 3,
  completeText: "收集完成，掉出第二份小礼物。",
  continueText: "查看第二份礼物",
};

export const secondGift: GiftReward = {
  eyebrow: "Reward 02",
  lockedTitle: "第二份礼物出现了",
  openedTitle: "第二个小礼物公开",
  closedText: "这次先闻到一点香香的预告。",
  item: "发香喷雾",
  description: "希望你每天出门的时候，都能带着一点轻轻的好心情。",
  images: [
    {
      src: "/gifts/hair-mist.jpg",
      alt: "发香喷雾",
      label: "hair-mist.jpg",
    },
  ],
  continueText: "继续挑战第三关",
};

export const memories: Memory[] = [
  {
    date: "5.27",
    title: "很快和好的一天",
    images: [
      {
        src: "/photos/memory-weihai-01.jpg",
        alt: "5.27 的房间小瞬间",
        label: "图 1",
      },
    ],
    diary: `我们吵了一个小架
很快就和好了
我们一起看颜凯发的抖音
释怀了 为他们感到惋惜
我很幸福😊`,
  },
  {
    date: "5.28",
    title: "夜市和路边摊",
    images: [
      {
        src: "/photos/memory-weihai-02.jpg",
        alt: "5.28 飞机上的侧影",
        label: "图 2",
      },
      {
        src: "/photos/memory-weihai-03.jpg",
        alt: "5.28 安静的小片刻",
        label: "图 3",
      },
      {
        src: "/photos/memory-weihai-04.jpg",
        alt: "5.28 夜市路边摊",
        label: "图 4",
      },
    ],
    diary: `坐飞机抖得有点厉害 有点微紧张 你睡得有点死呀

太幸福来不及记录
我们逛夜市
买了很多路边摊猛吃
我真是怕胖了`,
  },
  {
    date: "5.29",
    title: "电动车和小醉",
    images: [
      {
        src: "/photos/memory-weihai-14.jpg",
        alt: "5.29 晚上的贴贴合照",
        label: "图 1",
      },
      {
        src: "/photos/memory-weihai-15.jpg",
        alt: "5.29 晚上的可爱合照",
        label: "图 2",
      },
    ],
    diary: `我们租了电动车
在威海路上狂飙
宝宝在我背后搂着我
跟我说她好幸福 问我幸不幸福
我当然幸福 太幸福了☺️🥰

喝的小醉了还跟路上的路边摊阿姨打招呼
你有点太可爱了`,
  },
  {
    date: "5.30",
    title: "海边、公园和晚饭",
    images: [
      {
        src: "/photos/memory-weihai-11.jpg",
        alt: "5.30 夕阳下的海面",
        label: "图 3",
      },
      {
        src: "/photos/memory-weihai-12.jpg",
        alt: "5.30 海边的夕阳",
        label: "图 4",
      },
      {
        src: "/photos/memory-weihai-16.jpg",
        alt: "5.30 镜子前的合照",
        label: "图 5",
      },
      {
        src: "/videos/memory-0530-extra.mp4",
        alt: "5.30 的小视频",
        label: "视频",
        type: "video",
      },
    ],
    diary: `去公园拍照了
海边还是美 夕阳照在水面上
祝榕穿了好短的裙子 真是怕她走光😕
拍了很多美照 但我的照片略丑
晚上吃了赶海归来 美味😋
喉咙都吃痛了
幸福 已经开始想你了 好珍惜`,
  },
  {
    date: "5.31",
    title: "要回家的那天",
    images: [
      {
        src: "/photos/memory-weihai-17.jpg",
        alt: "5.31 整理行李",
        label: "图 6",
      },
      {
        src: "/photos/memory-weihai-18.jpg",
        alt: "5.31 车窗边的小瞬间",
        label: "图 7",
      },
      {
        src: "/photos/memory-weihai-19.jpg",
        alt: "5.31 回程路上的合照",
        label: "图 8",
      },
    ],
    diary: `要回家了有点不舍得
看到你整行李的样子真可爱
吃螺蛳粉吃出虫子 商家态度很差 敢凶你 随时准备发飙
不想修眼镜还是修了 感觉花了冤枉钱
热怒症要犯了
宝宝坐在身边就开心`,
  },
  {
    date: "6.3",
    title: "分开后的想念",
    images: [
      {
        src: "/photos/memory-weihai-20.jpg",
        alt: "6.3 想念的夜晚",
        label: "图 9",
      },
    ],
    diary: `你说你有分离焦虑了可能其实我很开心
但我其实早就很焦虑了`,
  },
  {
    date: "6.8",
    title: "很想很想你",
    images: [
      {
        src: "/photos/memory-weihai-21.jpg",
        alt: "6.8 生病也很可爱的宝宝",
        label: "图 10",
      },
    ],
    diary: `幸福 好喜欢你宝宝
想你想亲死你
生病了我的宝宝
恐怕被我传染了
默默滴眼泪可怜死了`,
  },
  {
    date: "6.12",
    title: "偷偷准备礼物",
    images: [
      {
        src: "/videos/memory-0612.mp4",
        alt: "6.12 偷偷准备礼物的视频",
        label: "视频",
        type: "video",
      },
    ],
    diary: `偷偷去给你准备礼物
心里琢磨了半天
感觉你一定会喜欢
偷偷摸摸的
给你准备礼物特别开心`,
  },
];

export const memoryPageText = {
  eyebrow: "Memory Album",
  title: "回忆照片与日记",
  subtitle: "有些日子很轻，但放在一起就很珍贵。",
  continueText: "继续下一关",
  previousLabel: "上一张",
  nextLabel: "下一张",
  closeLabel: "关闭",
};

export const albumBgm = {
  src: "/audio/album-bgm.mp3",
  title: "弹给路小雨的吉他",
  artist: "Jazzzcz",
  playText: "播放 BGM",
  pauseText: "暂停 BGM",
  missingText: "BGM 待放入",
};

export const gameBgm = {
  src: "/audio/game-bgm.mp3",
  title: "地上BGM",
  artist: "近藤浩治",
};

export const bossBattle: BattleText = {
  id: "boss",
  eyebrow: "Final Battle",
  title: "第三关：贱眼魔王",
  subtitle: "它挡在回忆相册前面，这次要认真打。",
  hpLabel: "魔王 HP",
  attackLabel: "攻击贱眼魔王",
  hp: 260,
  damage: 20,
  lines: [
    "最后一关了，敢不敢打重点？",
    "相册就在我后面，先过我这关",
    "魔法和拳头都没用吗？",
    "好吧，回忆相册是你的了",
  ],
  defeatedText: "第三关通关，回忆相册已解锁。",
  unlockedText: "相册钥匙掉出来了",
  continueText: "打开回忆相册",
};

export const fakeEndingText = {
  title: "谢谢你一路玩到这里。",
  birthday: "生日快乐。",
  wish:
    "希望宝宝今天开心，希望宝宝每天开心。你说你的生日老是考试，小小爱哭鬼，不要再流眼泪了昂。今年是我们第一个一起过的生日，要开开心心的，永远都是我最爱的小宝宝。",
  cakeImage: {
    src: "/photos/cake.jpg",
    alt: "生日蛋糕",
    label: "cake.jpg",
  },
  images: [
    {
      src: "/photos/ending-01.jpg",
      alt: "最后一页照片 1",
      label: "ending-01.jpg",
    },
    {
      src: "/photos/ending-02.jpg",
      alt: "最后一页照片 2",
      label: "ending-02.jpg",
    },
    {
      src: "/photos/ending-03.jpg",
      alt: "最后一页照片 3",
      label: "ending-03.jpg",
    },
    {
      src: "/photos/ending-04.jpg",
      alt: "最后一页照片 4",
      label: "ending-04.jpg",
    },
    {
      src: "/photos/ending-05.jpg",
      alt: "最后一页照片 5",
      label: "ending-05.jpg",
    },
    {
      src: "/photos/ending-06.jpg",
      alt: "最后一页照片 6",
      label: "ending-06.jpg",
    },
    {
      src: "/photos/ending-07.jpg",
      alt: "最后一页照片 7",
      label: "ending-07.jpg",
    },
    {
      src: "/photos/ending-08.jpg",
      alt: "最后一页照片 8",
      label: "ending-08.jpg",
    },
    {
      src: "/photos/ending-09.jpg",
      alt: "最后一页照片 9",
      label: "ending-09.jpg",
    },
    {
      src: "/photos/ending-10.jpg",
      alt: "最后一页照片 10",
      label: "ending-10.jpg",
    },
    {
      src: "/photos/ending-11.jpg",
      alt: "最后一页照片 11",
      label: "ending-11.jpg",
    },
    {
      src: "/photos/ending-12.jpg",
      alt: "最后一页照片 12",
      label: "ending-12.jpg",
    },
    {
      src: "/photos/ending-13.jpg",
      alt: "最后一页照片 13",
      label: "ending-13.jpg",
    },
  ],
  button: "最后再点一下",
  modalTitle: "你不会以为这就结束了吧？",
  modalButtons: ["还有吗？", "我就知道没这么简单"],
};

export const finalGiftText = {
  eyebrow: "Final Page",
  title: "最后一页",
  subtitle: "真正想放在最后的，是这些话。",
  secretButtonText: "神秘大奖",
  secretButtonSubText: "点击就送",
  secretAriaLabel: "发现神秘大奖",
  secretTitle: "竟然被你发现了神秘大奖？",
  secretName: "神秘大奖",
  secretDescription:
    "这里确实藏着一个神秘大奖，但内容先不剧透。等它真正出现的时候，你就知道了。",
  secretCloseText: "先收下这份神秘感",
  nextLine: "还有最后几张照片和最后几句话。",
  cakeImage: {
    src: "/photos/cake.jpg",
    alt: "生日蛋糕照片",
    label: "cake.jpg",
  },
  finalPhoto: {
    src: "/photos/us-final.jpg",
    alt: "两人合照",
    label: "us-final.jpg",
  },
  blessing: [
    "生日快乐。",
    "这不是一个特别复杂的小游戏，但里面的每一关，都是我想给你准备的小惊喜。",
    "希望你新的一岁可以开心一点、轻松一点，遇到的事情都顺利一点，也希望我可以继续陪在你身边，一起吃饭、散步、拍照，一起过很多个普通但很好的日子。",
    "今天的礼物是给你的，今天的祝福也是给你的。",
    "生日快乐。",
    "我爱你。",
  ],
  restartText: "重新开始",
};

export type FinalGiftText = typeof finalGiftText;
