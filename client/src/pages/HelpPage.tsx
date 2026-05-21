import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Data ── */

interface HelpEntry {
  id: number;
  category: 'theory' | 'guide' | 'faq';
  title: string;
  summary: string;
  content: string;
}

const HELP_ENTRIES: HelpEntry[] = [
  {
    id: 1,
    category: 'theory',
    title: '什么是自我效能感？',
    summary: '班杜拉社会认知理论的核心概念',
    content: `<h3>自我效能感（Self-Efficacy）</h3>
<p>由心理学家阿尔伯特·班杜拉（Albert Bandura）于1977年提出，指个体对自己成功执行特定行为或达成预期结果的能力信念。它不是你实际拥有的技能，而是<strong>你对自己运用技能完成任务的信心</strong>。</p>
<h4>四大信息来源</h4>
<ul>
  <li><strong>掌握性经验：</strong>亲身成功的经历是提升自我效能感最有力的途径。</li>
  <li><strong>替代性经验：</strong>观察与自己相似的人成功完成任务，能增强"我也能做到"的信念。</li>
  <li><strong>言语说服：</strong>来自他人的鼓励和正面反馈，尤其是可信赖之人的肯定。</li>
  <li><strong>生理和情绪状态：</strong>积极的身心状态有助于形成积极的效能判断。</li>
</ul>
<h4>对大学新生的意义</h4>
<p>高自我效能感的新生更愿意接受挑战，在困难面前坚持更久，焦虑水平更低。研究发现，自我效能感是大一学生学业表现和心理健康的最强预测因子之一。在AI工具普及的今天，维持独立思考的信心尤为重要——依赖AI完成任务可能短时间内减轻压力，但长期会削弱真正的掌握性经验，形成"看似完成，实则无助"的困境。</p>`,
  },
  {
    id: 2,
    category: 'guide',
    title: '如何使用这套测评工具？',
    summary: '完成全套测评，查看多维报告',
    content: `<h3>效能追踪 使用指南</h3>
<p>本系统包含三份问卷：一般自我效能感量表（GSES）、大学生适应性量表（CUAS）和 AI 使用行为问卷。</p>
<h4>步骤一：开始测评</h4>
<p>在主页点击"开始新测评"按钮，进入分步问卷向导。依次回答所有题目，注意反向题（如"我很少制定学习目标"）系统会自动转换计分。</p>
<h4>步骤二：查看结果</h4>
<p>提交后页面将展示你的多维画像雷达图，以及自我效能感、学业适应、情绪适应等详细分数。分数越高表示状况越好。</p>
<h4>步骤三：追踪历史</h4>
<p>每次测评都会自动保存。你可以在"我的历史"页面查看趋势折线图，观察自己的变化。定期（如每月）测评有助于及早发现问题。</p>
<h4>步骤四：获取AI建议</h4>
<p>点击"生成反馈报告"，系统会综合你的分数给出个性化文字建议。你也可以通过右下角的AI问答助手随时提问。</p>
<h4>重要提示</h4>
<p>测评结果仅供自我了解参考，不构成临床诊断。若分数持续偏低或感到明显困扰，请寻求学校心理咨询中心的专业帮助。</p>`,
  },
  {
    id: 3,
    category: 'guide',
    title: '雷达图如何解读？',
    summary: '理解多维画像雷达图的各项指标含义',
    content: `<h3>雷达图（多维画像）解读</h3>
<p>雷达图以六个维度呈现你的综合状况，每个轴代表一项指标，数值越靠近边缘表示表现越好。</p>
<h4>六维指标说明</h4>
<ul>
  <li><strong>自我效能感：</strong>你对自身完成目标能力的信念程度。得分≥3.0为较高水平。</li>
  <li><strong>学业适应：</strong>在学习目标制定、学习方法运用等方面的适应情况。</li>
  <li><strong>情绪适应：</strong>对自己情绪的觉察、接纳和调节能力。</li>
  <li><strong>AI频率：</strong>过去一周使用AI工具的频率，反映当前AI使用习惯。</li>
  <li><strong>AI多样性：</strong>AI工具使用场景的广度，涵盖写作、代码、文献等多个领域。</li>
  <li><strong>AI感知：</strong>对AI工具影响的主观感受，涵盖效率提升与依赖担忧两个维度。</li>
</ul>
<h4>评级说明</h4>
<p>每个顶点旁显示评级（S/A+/A/B/C/D），基于归一化分数计算：S≥0.9，A+≥0.75，A≥0.6，B≥0.45，C≥0.3，D＜0.3。评级为S或A+表示该维度表现优异，C或D则值得关注。</p>
<h4>形状含义</h4>
<p>雷达图面积越大、形状越饱满，代表整体状况越好。如果某个维度明显向内凹陷，说明该领域有提升空间。</p>`,
  },
  {
    id: 4,
    category: 'guide',
    title: '如何降低AI依赖风险？',
    summary: '识别过度依赖AI的信号，建立健康使用习惯',
    content: `<h3>降低AI依赖风险</h3>
<p>AI工具是强大的辅助资源，但过度依赖可能削弱独立思考和问题解决能力。</p>
<h4>过度依赖的警示信号</h4>
<ul>
  <li>遇到问题第一反应是打开AI，而非先自行思考</li>
  <li>没有AI帮助时，对完成课业缺乏信心</li>
  <li>使用AI后仍感到焦虑或不踏实</li>
  <li>AI使用频率和多样性持续偏高，且感知分数中依赖条目得分高</li>
</ul>
<h4>改善策略</h4>
<ol>
  <li><strong>先尝试，后求助：</strong>面对任务，给自己设定15-30分钟的独立思考时间，再借助AI辅助。</li>
  <li><strong>将AI从"替代者"转为"教练"：</strong>让AI解释思路而非直接给出答案。</li>
  <li><strong>定期"断联练习"：</strong>每周安排1-2段无AI的学习时段，完成后复盘感受。</li>
  <li><strong>丰富AI使用场景的健康比例：</strong>增加创意生成、文献检索等"拓展型"使用，减少直接代写、代答等"替代型"使用。</li>
  <li><strong>关注过程而非结果：</strong>建立学习日志，记录自己掌握的新知识、新技能。</li>
</ol>
<h4>系统如何帮助你</h4>
<p>通过在"我的历史"页面追踪AI使用频率、多样性和感知分数的变化，你可以客观评估自己的AI使用模式是否趋于健康。</p>`,
  },
  {
    id: 5,
    category: 'theory',
    title: '什么是大学适应性？',
    summary: 'Schlossberg过渡理论在学习适应中的应用',
    content: `<h3>大学适应性</h3>
<p>大学适应性指新生在进入大学环境后，在学业、人际、情绪和生活自理等方面的调整与融入程度。基于Nancy Schlossberg的过渡理论（Transition Theory），大学入学是一种典型的"预期性过渡"，个体需要调动内部资源和外部支持来应对新环境的要求。</p>
<h4>学业适应</h4>
<p>包括制定学习目标的能力、学习方法的掌握、时间管理能力以及对大学教学方式的理解和适应。高学业适应者通常有清晰的学习计划并能灵活调整。</p>
<h4>个人/情绪适应</h4>
<p>指对自身优缺点的认知、情绪状态的觉察和调节，以及在面对挫折时的心理恢复力。情绪适应良好的学生更能保持稳定的心态面对大学中的起伏。</p>
<h4>CUAS量表说明</h4>
<p>本系统采用的中国大学生适应量表（CUAS）简版，包含学业适应和情绪适应两个维度各5题，采用5点计分。其中部分题目为反向计分（如"我很少制定学习目标"），系统已自动处理。</p>`,
  },
  {
    id: 6,
    category: 'theory',
    title: '社会认知理论三要素',
    summary: '个人、行为、环境三者如何相互作用',
    content: `<h3>三元交互决定论</h3>
<p>班杜拉的社会认知理论核心是三元交互决定论（Triadic Reciprocal Determinism），认为个人因素（认知、情感、生物特征）、行为和环境三者之间相互影响、互为因果。</p>
<h4>个人因素</h4>
<p>包括你的自我效能感、结果预期、目标设定等认知因素。例如，高自我效能感让你更愿意选择有挑战性的课程。</p>
<h4>行为因素</h4>
<p>你的具体行动——学习习惯、社交方式、求助行为等。成功的行为经历反过来增强自我效能感，形成正向循环。</p>
<h4>环境因素</h4>
<p>你所在的社会和物理环境——课堂氛围、同伴群体、AI工具的可及性等。一个支持性的环境能促进积极行为和个人成长。</p>
<h4>对AI时代的启示</h4>
<p>AI工具是环境因素的一部分。当你使用AI获得成功时（行为→结果），你对AI的依赖可能增强（环境影响个人），但同时你可能失去亲身掌握的机会（个人→行为链减弱）。理解这三元关系有助于你有意识地平衡AI使用。</p>`,
  },
  {
    id: 7,
    category: 'faq',
    title: '测评多久做一次比较合适？',
    summary: '推荐的测评频率与最佳实践',
    content: `<h3>推荐测评频率</h3>
<p>我们建议<strong>每4周（约一个月）</strong>进行一次全套测评。这个间隔足以观察到有意义的变化，同时不会因过于频繁而产生"练习效应"。</p>
<h4>适合测评的时机</h4>
<ul>
  <li>开学初（建立基线分数）</li>
  <li>期中考试前后（观察学业压力对适应性的影响）</li>
  <li>期末结束后（评估整个学期的变化）</li>
  <li>经历重大事件后（如换专业、参加实习、人际变动等）</li>
</ul>
<h4>追踪建议</h4>
<p>每次测评后查看"趋势分析"页面，关注折线图的变化方向。如果某项分数连续两次呈下降趋势，建议结合AI反馈报告深入反思，或与辅导员、心理咨询师交流。</p>`,
  },
  {
    id: 8,
    category: 'faq',
    title: '测评分数偏低怎么办？',
    summary: '面对低分结果时的理性应对方法',
    content: `<h3>分数偏低的应对指南</h3>
<p>首先请记住：<strong>测评分数不是对你的评判，而是一个了解自己当前状态的窗口。</strong>低分不是失败，而是精准定位成长方向的起点。</p>
<h4>理性解读</h4>
<ul>
  <li>查看各维度明细：是整体偏低还是某个特定维度偏低？</li>
  <li>对比历史数据：和上一次相比是上升还是下降？趋势比单次分数更有参考价值。</li>
  <li>关注AI反馈报告：系统会指出具体哪些方面值得关注。</li>
</ul>
<h4>行动建议</h4>
<ol>
  <li>选择1-2个最想改善的维度，制定小目标（如"本周每天独立学习30分钟后才使用AI"）。</li>
  <li>利用AI助手的"教练模式"——让它帮你分析问题而非替你解决。</li>
  <li>与效能伙伴AI对话，讨论具体困扰。</li>
  <li>如果分数持续偏低且伴随持续的情绪低落、失眠、食欲变化等，请务必寻求学校心理咨询中心的专业帮助。</li>
</ol>
<p>自我效能感和适应能力是可培养的。班杜拉的研究表明，通过积累掌握性经验和调整认知，人们可以在数周到数月内显著提升自我效能感。</p>`,
  },
  {
    id: 9,
    category: 'theory',
    title: 'AI时代的自我效能感挑战',
    summary: 'AI工具如何影响大学生的能力信心',
    content: `<h3>AI工具与自我效能感的双重关系</h3>
<p>AI工具的普及为大学生带来了效率提升，同时也对自我效能感构成了独特的挑战。</p>
<h4>积极影响</h4>
<ul>
  <li><strong>降低入门门槛：</strong>AI可以帮助你快速了解陌生领域，减少初期的挫败感。</li>
  <li><strong>增强学习体验：</strong>通过个性化解释和即时反馈，AI能让学习过程更有趣、更高效。</li>
  <li><strong>拓展可能性：</strong>AI辅助创意生成、数据分析等功能，让你能尝试以往不敢接触的任务。</li>
</ul>
<h4>潜在风险</h4>
<ul>
  <li><strong>掌握性经验流失：</strong>当AI替你完成了本该由你亲自实践的任务，你就失去了积累"我能行"体验的机会。</li>
  <li><strong>归因偏差：</strong>成功时归功于AI，失败时归咎于自己——长此以往会扭曲自我认知。</li>
  <li><strong>替代性依赖：</strong>"AI能做，我不需要学"的思维模式会削弱学习动机。</li>
</ul>
<h4>健康使用原则</h4>
<p>将AI定位为<strong>"学习伙伴"而非"替代者"</strong>。使用AI后问自己三个问题：我理解了这个结果吗？离开AI我能做到类似的事吗？这次使用让我学到了什么？</p>`,
  },
  {
    id: 10,
    category: 'faq',
    title: '数据隐私与安全保障',
    summary: '你的测评数据如何被存储和保护',
    content: `<h3>数据隐私说明</h3>
<p>我们重视你的数据隐私。以下是关于数据存储和使用的关键信息：</p>
<h4>数据存储</h4>
<ul>
  <li>你的测评数据存储在加密的数据库中，仅你可通过个人账号访问。</li>
  <li>密码经过加密处理，即使是系统管理员也无法查看明文密码。</li>
  <li>AI对话记录仅保留最近会话以提供上下文，不会用于其他目的。</li>
</ul>
<h4>你的权利</h4>
<p>你可以随时查看、导出或删除自己的数据。如需数据导出或账户删除，请联系系统管理员。</p>`,
  },
  {
    id: 11,
    category: 'guide',
    title: '如何与效能伙伴AI高效对话？',
    summary: '获取更有价值建议的提问技巧',
    content: `<h3>高效使用效能伙伴AI</h3>
<p>效能伙伴AI基于你的测评数据和心理学理论提供个性化建议。以下技巧能帮你获得更多收获：</p>
<h4>有效提问示例</h4>
<ul>
  <li><strong>具体化：</strong>"我的学业适应分数只有2.5，有什么具体方法可以改善学习方法？"</li>
  <li><strong>情境化：</strong>"每次期末前两周我都会很焦虑，有什么应对策略？"</li>
  <li><strong>追问：</strong>不要满足于第一条回复。可以说"你能给我一个具体的周计划示例吗？"</li>
  <li><strong>结合理论：</strong>"根据班杜拉的掌握性经验理论，我该如何设计一个小目标来提升信心？"</li>
</ul>
<h4>对话时机</h4>
<p>建议在查看测评报告后立即与AI对话，这时AI可以看到你的最新分数并给出针对性分析。日常遇到学业压力或适应问题时也可以随时打开对话。</p>`,
  },
  {
    id: 12,
    category: 'faq',
    title: 'GSES和CUAS量表的科学依据',
    summary: '测评量表的设计背景与信效度',
    content: `<h3>量表科学性说明</h3>
<h4>GSES — 一般自我效能感量表</h4>
<p>GSES（General Self-Efficacy Scale）由德国心理学家Ralf Schwarzer于1981年开发，是全球使用最广泛的自我效能感测量工具之一。量表为单维度结构，10个题目评估个体在面对各种挑战性情境时的总体自我效能信念。内部一致性信度（Cronbach's α）通常在0.76-0.90之间。</p>
<h4>CUAS — 中国大学生适应量表</h4>
<p>基于西方大学适应量表并针对中国大学生群体进行本土化修订，包含学业适应和情绪适应两个核心维度。5点计分提供了更细致的区分度。</p>
<h4>AI使用行为问卷</h4>
<p>本系统配套的AI使用行为问卷综合了使用频率、使用多样性和影响感知三个维度，旨在捕捉AI时代大学生特有的学习行为模式。该问卷仍在持续验证中，结果请结合其他信息综合判断。</p>`,
  },
];

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'theory', label: '理论概念' },
  { key: 'guide', label: '使用指南' },
  { key: 'faq', label: '常见问题' },
] as const;

const PAGE_SIZE = 5;

export default function HelpPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = HELP_ENTRIES;
    if (activeCat !== 'all') list = list.filter((e) => e.category === activeCat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q));
    }
    return list;
  }, [search, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (detailId) {
    const entry = HELP_ENTRIES.find((e) => e.id === detailId);
    if (!entry) return null;
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => setDetailId(null)}
            className="inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            返回列表
          </button>
          <div className="glass-card p-5 mb-6">
            <h1 className="text-xl font-bold text-[#1e1b4b] mb-1">{entry.title}</h1>
            <span className="text-xs text-[#a78bfa] bg-[#f0edff] px-2 py-0.5 rounded-full">
              {CATEGORIES.find((c) => c.key === entry.category)?.label ?? entry.category}
            </span>
            <div className="mt-4 text-sm text-[#1e1b4b] leading-relaxed space-y-3 help-content" dangerouslySetInnerHTML={{ __html: entry.content }} />
          </div>
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f7ff] to-[#e0d7fe] page-enter">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1 text-sm text-[#6b6893] hover:text-[#5244c2] transition-colors bg-transparent border-0 cursor-pointer mb-4"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          返回首页
        </button>

        <h1 className="text-2xl font-bold text-[#1e1b4b] mb-1">📖 帮助中心</h1>
        <p className="text-sm text-[#6b6893] mb-6">了解自我效能感概念、测评工具使用方法和常见问题</p>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a78bfa]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索帮助内容..."
            className="w-full pl-9 pr-4 py-2.5 border-2 border-[#e0d7fe] rounded-xl text-sm outline-none transition-all focus:border-[#5244c2] focus:shadow-[0_0_0_3px_rgba(82,68,194,0.1)] bg-white"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCat(cat.key); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-xl border-0 cursor-pointer transition-all ${
                activeCat === cat.key ? 'bg-[#5244c2] text-white shadow-sm' : 'bg-white text-[#6b6893] hover:bg-[#f0edff]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Entries */}
        {paged.length === 0 ? (
          <p className="text-center text-[#a78bfa] py-12">没有匹配的帮助条目</p>
        ) : (
          <div className="space-y-3">
            {paged.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setDetailId(entry.id)}
                className="w-full text-left p-4 rounded-xl bg-white border border-[#e0d7fe] cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1e1b4b]">{entry.title}</p>
                    <p className="text-sm text-[#6b6893] mt-1">{entry.summary}</p>
                  </div>
                  <span className="text-xs text-[#a78bfa] bg-[#f0edff] px-2 py-0.5 rounded-full flex-shrink-0">
                    {CATEGORIES.find((c) => c.key === entry.category)?.label ?? entry.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
              className="px-3 py-1.5 text-sm text-[#6b6893] hover:text-[#5244c2] disabled:opacity-30 bg-transparent border-0 cursor-pointer disabled:cursor-default">‹ 上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 text-sm font-medium rounded-lg border-0 cursor-pointer transition-colors ${n === safePage ? 'bg-[#5244c2] text-white' : 'bg-transparent text-[#6b6893] hover:bg-[#f0edff]'}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
              className="px-3 py-1.5 text-sm text-[#6b6893] hover:text-[#5244c2] disabled:opacity-30 bg-transparent border-0 cursor-pointer disabled:cursor-default">下一页 ›</button>
          </div>
        )}
      </div>
    </div>
  );
}
