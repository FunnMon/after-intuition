'use strict';
const CONTENT_VERSION = 3;
const MODULES = [
 {id:'seeing',title:'眼前的线索',description:'看一张图、读一句消息、认识一个人。',time:'约5分钟',concepts:['WYSIATI','过早下结论','上下文消歧','光环效应','问题替代']},
 {id:'choosing',title:'选择的参照',description:'看报价、挑套餐、决定留下还是离开。',time:'约5分钟',concepts:['框架效应','锚定效应','沉没成本','诱饵效应']},
 {id:'evidence',title:'证据的方向',description:'翻资料、看标题、检验一个说法。',time:'约5分钟',concepts:['确认倾向','可得性','合取规则','反例检验','因果推断']},
 {id:'remembering',title:'记忆里的故事',description:'预测一次活动，再回想事情如何发生。',time:'约5分钟',concepts:['事后偏见','外部视角','峰终体验','回归均值']}
];
const SOURCES = {
 book:{label:'Kahneman，Thinking, Fast and Slow（2011）',url:'https://us.macmillan.com/books/9780374275631/thinkingfastandslow/'},
 interview:{label:'卡尼曼本人访谈，A machine for jumping to conclusions（APA，2012）',url:'https://www.apa.org/monitor/2012/02/conclusions'},
 heuristics:{label:'Tversky & Kahneman，Judgment under Uncertainty（1974）',url:'https://doi.org/10.1126/science.185.4157.1124'},
 framing:{label:'Tversky & Kahneman，The Framing of Decisions（1981）',url:'https://doi.org/10.1126/science.7455683'},
 halo:{label:'Nisbett & Wilson，The Halo Effect（1977）',url:'https://doi.org/10.1037/0022-3514.35.4.250'},
 substitution:{label:'Kahneman，Maps of Bounded Rationality（2003，第五节）',url:'https://www.nobelprize.org/uploads/2018/06/kahnemann-lecture.pdf'},
 conjunction:{label:'Tversky & Kahneman，The Conjunction Fallacy（1983）',url:'https://doi.org/10.1037/0033-295X.90.4.293'},
 wason:{label:'Wason，Reasoning about a rule（1968）',url:'https://doi.org/10.1080/14640746808400161'},
 availability:{label:'Tversky & Kahneman，Availability（1973）',url:'https://doi.org/10.1016/0010-0285(73)90033-9'},
 decoy:{label:'Huber, Payne & Puto，Adding Asymmetrically Dominated Alternatives（1982）',url:'https://doi.org/10.1086/208899'},
 hindsight:{label:'Fischhoff，Hindsight ≠ Foresight（1975）',url:'https://doi.org/10.1037/0096-1523.1.3.288'},
 peakend:{label:'Kahneman et al.，When More Pain Is Preferred to Less（1993）',url:'https://doi.org/10.1111/j.1467-9280.1993.tb00589.x'}
};
const CERTAINTY = {low:'只是一个初步想法',medium:'比较倾向这个判断',high:'很有把握'};
const FORECAST_OPTIONS = [['high','人气很可能不错。'],['uncertain','成败都说得通，现在还拿不准。'],['low','人气很可能不理想。']];
const PLAN_OPTIONS = [['week','约1周'],['two','约2周'],['three','约3周'],['more','更久，需要留出更大余量']];
const TASKS = [
 {id:'scene',module:'seeing',title:'这个位置，适合安静工作吗？',form:'scene',context:'朋友发来一张咖啡馆照片。你正想找一个能安静工作两小时的地方。',prompt:'只看眼前这张照片，你现在更倾向于？',options:[['yes','感觉适合，我会把它列为优先选择。'],['no','感觉不太适合，我会先看其他地方。'],['check','先问一下噪音、座位与使用规则，再决定。']],confidence:true,note:'这是AI生成的虚构场景，不对应真实商家。'},
 {id:'chat',module:'seeing',title:'“明天有空聊一下吗？”',form:'chat',context:'你刚交完一份方案，负责人发来下面这条消息。没有其他上下文。',prompt:'你脑中最先浮现的解释，更接近哪一种？',options:[['bad','方案可能出了问题，明天要指出不足。'],['good','方案可能不错，明天要推进下一步。'],['routine','可能只是例行安排或补充资料。'],['open','几种解释都可能，我暂时没有确定倾向。']],confidence:true,note:'这里记录最先浮现的解释，不考“应该怎么想”。'},
 {id:'glyph',module:'seeing',title:'中间这个符号，你读成什么？',form:'glyph',context:'请看下面的一组字符，按第一眼的读法选择。',prompt:'你把中间的符号读成了？',options:[['B','字母 B'],['13','数字 13'],['ambiguous','它有歧义，我不能确定。']],note:'不用识别字体名称，也不用查资料。'},
 {id:'halo',module:'seeing',title:'你愿意信任这个新搭档吗？',form:'halo',context:'一次活动中，林屿表达清楚、态度友好，能迅速接住大家的问题。你还没有和他合作过。',prompt:'分别选择你目前对两件事的判断。',fields:[{name:'expression',label:'他的现场表达能力',options:[['positive','看起来不错'],['negative','看起来不太好'],['unknown','现有材料不足']]},{name:'delivery',label:'他能否长期准时交付',options:[['positive','看起来可靠'],['negative','看起来不可靠'],['unknown','还需要合作与交付记录']]}],note:'两项不必选成一样。'},
 {id:'substitution',module:'seeing',title:'一份看起来很专业的方案。',form:'substitution',context:'你要决定一份展览方案能否落地。演示稿排版精致、概念动人，预算与排期却还没展开。',prompt:'如果只能先做一件事，你会？',options:[['polish','继续打磨演示稿，让大家更容易被打动。'],['approve','先通过，整体看起来已经很成熟。'],['check','先核对预算、负责人、资源与关键节点。'],['taste','先问几位同事喜不喜欢这个创意。']],note:'此处的目标是判断“能否执行”，不是评选最好看的演示稿。'},
 {id:'frameStart',module:'choosing',title:'你会报名这节体验课吗？',form:'frame',context:'一家工作室开设120元的陶艺体验课。地点、时间和内容都适合你；评价只允许选“满意”或“不满意”。',prompt:'目前你更愿意怎么做？',options:[['book','愿意报名。'],['compare','先比较其他工作室。'],['skip','这次不报名。']],note:'按偏好选择，不计算对错。'},
 {id:'anchor',module:'choosing',title:'这个价格，给你的第一感觉是？',form:'anchor',context:'你在模拟商品页看到一盏台灯。它有基础调光功能、一年保修；没有同类成交价可供比较。',prompt:'看完商品页，你对299元的第一感觉是？',options:[['cheap','挺划算，有买到折扣的感觉。'],['fair','还算合适，可能会买。'],['expensive','偏贵，暂时不想买。'],['compare','要比较同类产品与实际成交价再判断。']],note:'所有价格均为本题的虚构展示，不是真实商品或交易。'},
 {id:'sunk',module:'choosing',title:'票已经买了，要不要看完？',form:'choice',context:'你买了不可退款的电影票。看了一会儿，确定自己不喜欢；附近有更想看的免费展览，时间来得及，离场也没有其他损失。',prompt:'此刻你更愿意？',options:[['stay','留下来，至少把买票的钱“看回来”。'],['leave','离场，把接下来的时间留给更喜欢的展览。'],['other','我还有其他目的，会重新权衡。']],note:'本题回看理由与未来成本，不给偏好打分。'},
 {id:'decoy',module:'choosing',title:'你会选哪一个观影套餐？',form:'staged',context:'两种观影券都在同一家影院使用，场次、有效期和退改条件相同。你可以按预算与需求自由选择。',prompt:'你更愿意购买？',firstOptions:[['basic','普通观影券，30元。'],['premium','观影券＋一份爆米花，45元。']],options:[['basic','普通观影券，30元。'],['premium','观影券＋一份爆米花，45元。'],['decoy','观影券＋同一份爆米花，50元。']],stagePrompt:'商家又展示了第三个套餐。其他条件没有改变，你现在更愿意购买？',stageNote:'三个套餐只有列出的差别。较高价格不代表额外品质或权益。',note:'会先记下你的第一次选择，再展示后续选项。'},
 {id:'frameEnd',module:'choosing',title:'再看一次，这次你会报名吗？',form:'frame',context:'一家工作室开设120元的陶艺体验课。地点、时间和内容都适合你；评价只允许选“满意”或“不满意”。',prompt:'目前你更愿意怎么做？',options:[['book','愿意报名。'],['compare','先比较其他工作室。'],['skip','这次不报名。']],note:'请按此刻的感受选择，不需要迁就之前的答案。'},
 {id:'search',module:'evidence',title:'你会先打开哪两份资料？',form:'search',context:'同事提出：“远程办公让这个团队的效率下降了。”你要决定是否支持取消远程办公。',prompt:'先选一个初步立场，再查看你最想读的两份材料。',firstOptions:[['support','初步倾向支持这句话。'],['against','初步倾向不支持这句话。'],['open','暂时没有立场。']],options:[['support','支持取消远程办公。'],['against','不支持取消远程办公。'],['more','需要补充比较与背景，再作决定。']],note:'本题记录你怎样找资料，不按立场计算对错。'},
 {id:'news',module:'evidence',title:'最近，似乎到处都是这类事。',form:'news',context:'你连续看到了下面几条模拟资讯，标题很容易留下印象。',prompt:'关于这座城市的电池起火事件，你现在愿意作出的判断是？',options:[['increase','比上个月更多了。'],['rare','应该仍然很少，不值得关注。'],['unknown','这些事值得关注，但仅凭标题无法判断总体趋势。']],note:'全部标题为虚构材料，不代表真实新闻。'},
 {id:'conjunction',module:'evidence',title:'关于小岑，你会选哪张描述？',form:'conjunction',context:'小岑喜欢旧建筑，参与过街区保护活动，周末常去参观展览。你不知道她现在的职业。',prompt:'关于两张描述卡片的可能性，你认为？',options:[['a','第一张至少与第二张一样可能。'],['b','第二张更可能，因为更符合她的兴趣。'],['unknown','无法比较这两种情况的可能性。']],note:'第一张描述也包括同时做志愿者的出版社编辑。'},
 {id:'cards',module:'evidence',title:'要检查规则，你会翻哪几张卡？',form:'cards',context:'每张卡的一面写材料，另一面写底座颜色。工作室规定：“如果展品是陶瓷，底座就必须是蓝色。”',prompt:'要查出是否有卡片违反这条规则，你认为必须翻哪些？',note:'可以多选。只选必须检查的卡，不需要把所有卡都翻开。'},
 {id:'cause',module:'evidence',title:'客流增加了，怎么写这次复盘？',form:'choice',context:'一家小店换了招牌，随后客流明显增加。同一时期，附近施工结束，街口又新增了公交站。',prompt:'你要写复盘标题，会选哪一句？',options:[['sign','换招牌，是这次客流增长的关键。'],['bus','新公交站，是这次客流增长的关键。'],['separate','几项变化同时发生，目前还分不清各自影响。'],['all','三项变化肯定都有效，应该全部复制。']],note:'请选择最能被目前材料支持的说法。'},
 {id:'forecast',module:'remembering',title:'活动还没开始，你先留一个判断。',form:'forecast',context:'一家小书店准备周末办首场旧书交换会。宣传转发不少，但还没做预约；主题新颖，场地却不在主要商圈。没有同类活动记录。',prompt:'对于最终人气，你现在更接近哪种判断？',options:FORECAST_OPTIONS,confidence:true,note:'先记录预测，后面会有一段虚构后续。'},
 {id:'planning',module:'remembering',title:'这次做手册，你会留多久？',form:'staged',context:'你独立制作一本12页活动手册，资料齐全。按自己的安排，一周能完成初稿与检查；同时也有其他日常工作。',prompt:'考虑打断、返工和等待，你会给这次留出？',firstOptions:PLAN_OPTIONS,options:PLAN_OPTIONS,stagePrompt:'看完同类项目记录后，你现在会留出？',stageNote:'同一人员、相近复杂度与资源条件。此次没有额外资源或已知的特殊简化。',note:'这是预测回看，不要求你给出一个精确数字。'},
 {id:'peak',module:'remembering',title:'哪段旅行，你更想再经历一次？',form:'peak',context:'下面是两段同样长的虚构旅行记录。纵向越高表示当时越愉快；横向表示时间推进。',prompt:'如果只凭整体印象，你更想重复哪一段？',options:[['a','旅行A'],['b','旅行B'],['either','没有明确偏好，还需要知道具体经历。']],note:'这里是想象中的偏好，不等于真实经历后的记忆测量。'},
 {id:'regression',module:'remembering',title:'下一次，她表现好了。',form:'regression',context:'一位新同事平时表现有好有坏。某次发挥特别差，负责人严厉批评了她；下一次，她恢复到了平常水平。',prompt:'这段前后变化，最能支持哪一种说法？',options:[['works','严厉批评很有效，之后可以继续用。'],['fear','她是因为害怕挨批评才进步的。'],['unclear','改善确实发生了，但仅凭这次变化，还不能确定批评的作用。']],note:'不需要计算成绩，只看这段材料能支持什么。'},
 {id:'hindsight',module:'remembering',title:'知道后续后，再想想最初的自己。',form:'hindsight',context:'还记得前面那场旧书交换会吗？现在，你会看到一段虚构后续。',prompt:'先不看原记录，回想你开始时的判断。你当时更接近？',options:FORECAST_OPTIONS,note:'后续是教学情境的一部分，不用于检验你的现实预测能力。'}
];
const EVIDENCE_CARDS = [
 {id:'complaints',title:'“协作变难”的员工访谈',tag:'访谈',body:'几位员工抱怨消息回复慢。访谈没有包含满意的员工，也没有比较现场办公时的回复速度。'},
 {id:'late',title:'延期项目的沟通记录',tag:'个案',body:'一个远程项目延期了。同期需求改了三次，现场办公的协作方也延后交付；尚不能分离各因素。'},
 {id:'comparison',title:'同团队前后交付与任务难度',tag:'对照线索',body:'最近两月交付基本持平，但任务复杂度不同。数据可以帮助比较，还需进一步控制工作量与人员变化。'},
 {id:'counter',title:'未延期项目的工作方式',tag:'其他案例',body:'团队也有远程项目按时完成。可以用来检查“远程必然低效”是否过强，但不能仅凭成功案例证明远程一定更好。'}
];
const NEWS = ['电动车电池起火，车主紧急撤离','一处充电点发生电池起火','街边电动车冒烟，路人协助处置','电池起火画面引发讨论'];
const CARD_OPTIONS = [['pottery','陶瓷','材料面'],['wood','木制','材料面'],['blue','蓝色底座','颜色面'],['red','红色底座','颜色面']];
function tasksForModules(ids){return TASKS.filter(t=>ids.includes(t.module));}
function revealPagesForModules(ids){return MODULES.filter(m=>ids.includes(m.id)).flatMap(m=>{const ts=TASKS.filter(t=>t.module===m.id);return [{module:m.id,ids:ts.slice(0,3).map(t=>t.id)},{module:m.id,ids:ts.slice(3).map(t=>t.id)}];});}
function optionText(options,value){return (options?.find(o=>o[0]===value)?.[1]||'未记录').replace(/。$/,'');}
function selectedText(id,a){const t=TASKS.find(t=>t.id===id);if(!a)return '未参与';if(t.form==='halo')return t.fields.map(f=>`${f.label}：${optionText(f.options,a[f.name])}`).join('；');if(t.form==='cards')return CARD_OPTIONS.filter(x=>a.cards?.includes(x[0])).map(x=>x[1]).join('、')||'未选择';if(['staged','search'].includes(t.form))return `起初：${optionText(t.firstOptions,a.first)}；之后：${optionText(t.options,a.value)}`;return optionText(t.options,a.value);}
function cardRuleValid(cards){return Array.isArray(cards)&&cards.length===2&&cards.includes('pottery')&&cards.includes('red');}
function interpretTask(id,answers,meta){
 const extra=interpretExtraTask(id,answers,meta); if(extra)return extra;
 const a=answers[id]||{}, result={id,answer:selectedText(id,a),certainty:CERTAINTY[a.certainty],visual:null};
 const set=(concept,title,body,method,limit,sources,visual=null)=>Object.assign(result,{concept,title,body,method,limit,sources,visual});
 if(id==='scene')set('WYSIATI：眼前信息不等于全部','照片没有拍到的，也可能影响决定。',[`你看到的是同一张图的局部。完整画面还有窗外施工；但即便看见施工，也不能直接知道室内的实际噪音。`,`WYSIATI描述一种思考方式：用眼前的线索拼出完整故事，却没有主动为尚未出现的相关信息留位置。${a.value==='check'?'你这次选择先补充信息。':'你这次先形成了一个场所偏好；可以回想，安静这一属性是否真的有直接证据。'}`],'把“照片告诉了我什么”和“我还需要知道什么”各列一项。','局部画面不是骗局，补充信息也不等于证明你原先选错。此处演示证据边界，不给个人下诊断。',['interview'],'scene-full');
 if(id==='chat')set('Jumping to conclusions：过早下结论','一句消息，容得下不止一个故事。',[`“明天有空聊一下吗？”与批评、肯定、补资料都相容。我们没有设定一个隐藏的真实原因。`,`你先选择了“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”${a.certainty?`，把握是“${CERTAINTY[a.certainty]}”`:''}。形成初步解释本身很正常；需要区分的是，什么是消息本身，什么是自己补上的情节。`],'在最先想到的解释之外，再给出一个同样符合已知事实的解释。','“眼前信息不等于全部”讨论证据范围，过早结论讨论形成解释的过程；二者可以重叠，不是两类人格。',['interview'],'chat-alternatives');
 if(id==='glyph')set('上下文消歧','符号没变，周围的线索变了。',[`你本次看到${meta.glyphContext==='letters'?'字母':'数字'}上下文，选择读成“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。两幅图中间使用完全相同的图形。`,'快速思考会借助上下文，自动选出一个读法。这通常帮助理解；含糊线索却也可能在你注意到歧义之前，被补成确定含义。'],'遇到含糊的词、表情或片段时，尝试换一个上下文再读。','这里没有唯一错误读法。一次视觉消歧不能推出你在日常生活中爱下结论。',['book'],'glyph-compare');
 if(id==='halo')set('光环效应','一项好表现，会不会替其他能力作担保？',[`你对表达的判断是“${optionText(TASKS.find(t=>t.id===id).fields[0].options,a.expression)}”，对交付的判断是“${optionText(TASKS.find(t=>t.id===id).fields[1].options,a.delivery)}”。`,'材料直接展示了现场表达，却没有长期交付记录。光环效应关注整体好感或突出特征，如何扩散到其他属性。表达好与交付可靠可以同时成立，但前者不能单独保证后者。'],'按属性分别找证据：表达看现场，交付看记录。','这不是说友好的人不可靠，也不能凭你的选择确认光环已经发生。',['halo']);
 if(id==='substitution')set('问题替代','你在判断能执行，还是看着很成熟？',[`本题目标是能否执行。漂亮的演示稿更容易回答的是“是否吸引人”，要判断能否落地，还需要预算、资源和依赖关系方面的证据。`,`你选择了“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。问题替代描述的是，较难的问题被一个更容易的问题悄悄顶替；不是说审美不重要。`],'先把真正的问题写成一句话，再检查正在使用的证据是否对得上。','如果任务本来就是选最好看的演示稿，按审美选择并没有偏离目标。',['substitution'],'question-compare');
 if(id==='frameStart')set('框架效应','满意与不满意，说的是同一份评价。',[`第一次你选择“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”，第二次选择“${optionText(TASKS.find(t=>t.id==='frameEnd').options,answers.frameEnd?.value)}”。`,'两张评价卡都来自同一组100人，只有满意或不满意两种回答。90人满意与10人不满意是同一份信息。措辞改变可能影响感受，报名与否本身没有标准答案。',answers.frameEnd?.value===a.value?'你的两次选择一致，本次没有观察到这对任务中的选择变化。':'你的两次选择不同。它与框架影响相符，也可能包含记忆、顺序和重新思考的影响。'],'把两种说法换算成同一份结果清单，再作选择。','这是单人前后对照，不是对框架效应的独立实验，也不能计算个人敏感度。',['framing'],'frame-compare');
 if(id==='anchor')set('锚定效应','299元之前，你先看见了哪个数？',[`你看到的划线价是${meta.anchorPrice}元，实际展示价是299元；你的判断是“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。`,'本题划线价由程序在399元与999元之间随机分配，不是经过核实的历史成交价。另一个版本的其他条件与选项完全相同。先出现的数字可能成为比较起点。'],'先确定自己的用途与预算，再查看独立的同类成交信息。','单人只经历一种版本，不能分离锚、预算和市场经验的作用。没有组间数据，不给出“你的锚定强度”。真实报价有时也含有效信息。',['heuristics'],'anchor-compare');
 if(id==='sunk')set('沉没成本','过去的钱，不能由未来的时间追回。',['题设中票款不可退。继续看电影，也不会让这笔钱重新回来；下一步更相关的是，哪种安排能带来你更想要的体验。',`你选择“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。如果你有其他目的，例如想看结局或陪伴朋友，这些属于未来收益，应当纳入考虑。`],'暂时把已经无法收回的支出盖住，只比较从现在开始的成本与收益。','不把留下或离开本身定义为错误；真实情境还可能有转换成本。',['book']);
 if(id==='decoy')set('诱饵效应','那个不划算的选项，也可能改变比较。',[`你起初选“${optionText(TASKS.find(t=>t.id===id).firstOptions,a.first)}”，加入第三项后选“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。`,'50元套餐与45元套餐的内容完全相同，因此被45元套餐严格支配。它可能让45元那项更显眼，却没有改变30元与45元原本的内容或价格。',a.first===a.value?'你保留了原来的选择，本次未观察到偏好改变。':'你的选择发生了变化；也可能是重新考虑了需求，不能仅归因于第三项。'],'先排除被严格支配的选项，再按自己的需求比较剩下的选择。','这是教学改编的单人前后任务，未复现原始实验设计。诱饵效应作为选择研究的补充，不冒充原书专有内容。',['decoy']);
 if(id==='frameEnd')set('参考与选择回看','感受可以变，事实需要单独留住。',['陶艺课的第二张评价卡没有带来新的满意度事实。将两次记录并排，是为了观察同一信息如何被组织。','这个模块里的划线价、额外套餐与既有支出，分别属于参照数字、选项结构和过去成本，不应混为一个“容易被营销”的标签。'],'做决定前问：变的是事实、参照，还是我的需求？','前一页已经回看了两次报名选择，这里不重复计算或累加“偏差次数”。',['framing']);
 if(id==='search') {const cards=EVIDENCE_CARDS.filter(c=>a.read?.includes(c.id));set('确认倾向','你先打开的资料，是否允许自己改变主意？',[`你的初步立场是“${optionText(TASKS.find(t=>t.id===id).firstOptions,a.first)}”。先读的是：${cards.map(c=>c.title).join('、')}。`,'访谈与延期个案可能支持一个故事，也可能受选样和其他因素影响。更有用的是能比较替代解释的资料；看到反方材料本身，也不保证它质量更高。'],'检索前写下：什么证据会让我修改当前看法？然后主动找它。','不能凭先读两份资料确认你有确认偏差；兴趣、信息价值与已有知识都可能影响选择。',['book','wason']);}
 if(id==='news')set('可得性启发','容易想起，不等于发生得更多。',['连续的生动画面容易被想起，也可能让事件显得普遍。标题未提供总量、重复报道情况或上个月的可比记录。',`你选择“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。需要关注风险，与能否判断趋势，是两个问题。`],'判断是否变多时，找同一口径、同一时间跨度的统计。','本题没有真实总体频率，不会用一个虚构真值给你的直觉打分。',['availability']);
 if(id==='conjunction')set('代表性与合取规则','更具体的描述，范围反而更小。',['“出版社编辑且参与建筑保护”中的每一个人，也必然是一名出版社编辑。因此，第二种情况的可能性不能高于第一种。','这不需要知道小岑的真实职业，也不用估百分比。更贴合人物故事的描述，可能显得更可信，但可信感与概率范围不是同一件事。'],'遇到“而且”“同时”时，先看增加条件后，范围是扩大还是缩小。','只核对包含关系，不评价你猜人物职业的能力。',['conjunction'],'set-compare');
 if(id==='cards')set('反例检验','找到违反规则的机会，才是在检查规则。',[`你选择翻开：${selectedText(id,a)}。必须检查的是陶瓷卡与红色底座卡。`,'陶瓷卡背面若不是蓝色就违规；红色底座背面若是陶瓷也违规。木制品可以用任意颜色，蓝色底座也不要求一定配陶瓷。',cardRuleValid(a.cards)?'你的选择覆盖了两种可能的反例，且没有增加不必要的检查。':'可以重新想象每张卡背面最不利的情况：哪些情况真的会推翻规则？'],'检验“如果A就B”，重点寻找A却不B的情况。','这是简化的逻辑任务；遗漏卡片也可能源于阅读或规则理解，不等于人格上的确认偏差。',['wason'],'cards-answer');
 if(id==='cause')set('因果故事','先后发生，尚不能分清谁带来了变化。',['招牌、施工结束与公交站变化同时发生。客流上升是真的，但没有同条件的比较，不能把贡献单独归给其中一项，也不能断定三项全部有效。','一个顺畅的原因故事容易理解，却可能跳过替代解释。'],'先列出同期变化，再寻找能区分它们的对照与记录。','本场景演示因果推断边界，未估计任何因素的真实效应。',['book','interview']);
 if(id==='forecast')set('预测时的不确定性','保留当时不知道的事。',[`活动开始前，你记录的是“${optionText(FORECAST_OPTIONS,a.value)}”，把握为“${CERTAINTY[a.certainty]}”。`,'转发量、主题与地点能提供线索，但没有预约与同类记录。一个最终结果不能倒过来，把当时的不确定性变成当时已经知道的事实。'],'在结果出现之前，留下一句判断、依据，以及可能让它失败的条件。','本题不按虚构活动的后续给预测判分。',['hindsight']);
 if(id==='planning')set('外部视角与计划谬误','故事里的顺利，遇到了记录里的实际。',[`你先选“${optionText(PLAN_OPTIONS,a.first)}”，看记录后选“${optionText(PLAN_OPTIONS,a.value)}”。`,'三次同类任务分别用时两周、三周、两周多。它们补充了返工与等待的现实参照；并不能保证这次必然需要相同时长。'],'预测之前，先找类似项目真正用了多久，再说明这次有什么不同。','调整或不调整，都可能有合理理由。本题不以是否选两周或三周判断你是否存在计划谬误。',['book']);
 if(id==='peak')set('峰终体验与记忆','你记住的是整段，还是某个瞬间？',[`你选择“${optionText(TASKS.find(t=>t.id===id).options,a.value)}”。图里的A大部分时间愉快，末尾明显变差；B整体较平稳，结尾较好。`,'研究中的回顾评价可能较受高峰与结尾影响，但这不是“任何人只记得结尾”的定律。想象图表后的选择，也不同于实际经历后的记忆。'],'复盘一次体验时，分别记下全过程、最强烈的片段与结尾，再比较它们。','偏好没有标准答案；不从你选A或B计算峰终效应强弱。',['peakend']);
 if(id==='regression')set('回归均值与解释的诱惑','特别差之后改善，未必全是批评的功劳。',['如果极端表现里含有偶然波动，下一次就可能更接近平常水平，即使没有批评也可能如此。恢复常态，不能单独说明是哪种干预起了作用。','这也不表示批评肯定没作用，更不表示现实中的水平永远不变。'],'评估干预时，把自然波动与干预效果分开，寻找更多可比记录。','这里只说明一个可能的替代解释；不能根据前后一次成绩判断因果。',['heuristics']);
 if(id==='hindsight'){const initial=answers.forecast?.value,recall=a.value;const pos={high:1,uncertain:0,low:-1};const toward=(pos[recall]-pos[initial])*(meta.outcome==='high'?1:-1)>0;set('事后偏见','现在的回想，与当时的记录一样吗？',[`当时记录：${optionText(FORECAST_OPTIONS,initial)}。知道后续后的回忆：${optionText(FORECAST_OPTIONS,recall)}。`,initial===recall?'两次表述一致，本次没有观察到回忆与原记录的差异。':toward?'这次回忆比原记录更靠近已经发生的后续。它与事后偏见讨论的方向相符，也可能来自记忆、措辞理解或有意重选。':'两次表述不同，但变化并未朝已知后续的方向移动；不把它解释成事后偏见。','知道结局以后，过去的线索可能显得比当时更有指向性。保留原记录，比凭今天的感觉重建昨天更可靠。'],'复盘时先读当时的记录，再评价当时的信息是否足以支持决定。','这里只观察回忆与记录是否不同；不把一次差异认定为稳定的记忆偏差。',['hindsight'],'forecast-compare');}
 return result;
}
'use strict';
/* Original teaching scenarios. Staged first answers must be sealed by the UI;
   this content and interpretation layer never changes answers. No individual scores. */
const EXTRA_MODULES = [
 {id:'owning',title:'拥有与放手',description:'收到礼物、调整设置，再看同一笔钱。',time:'约5分钟',concepts:['禀赋效应','损失厌恶','默认与现状','心理账户','窄框架']},
 {id:'portraits',title:'人物与故事',description:'猜一个岗位，读成功故事，看看偶然留下的图案。',time:'约5分钟',concepts:['基率与代表性','情境与归因','幸存者偏差','随机性','小样本']},
 {id:'intuiting',title:'直觉的把握',description:'熟悉的句子、自信的评审，以及一个好结果。',time:'约5分钟',concepts:['重复与熟悉感','专家直觉的条件','有效性错觉','结果偏差','聚焦错觉']}
];
const EXTRA_SOURCES = {
 x_book:{label:'Kahneman，Thinking, Fast and Slow（2011；原创教学情境改编）',url:'https://us.macmillan.com/books/9780374275631/thinkingfastandslow/'},
 x_endowment:{label:'Kahneman, Knetsch & Thaler，Experimental Tests of the Endowment Effect and the Coase Theorem（1990）',url:'https://doi.org/10.1086/261737'},
 x_loss:{label:'Tversky & Kahneman，Loss Aversion in Riskless Choice（1991）',url:'https://doi.org/10.2307/2937956'},
 x_statusquo:{label:'Samuelson & Zeckhauser，Status Quo Bias in Decision Making（1988）',url:'https://doi.org/10.1007/BF00055564'},
 x_accounting:{label:'Thaler，Mental Accounting and Consumer Choice（1985）',url:'https://doi.org/10.1287/mksc.4.3.199'},
 x_broad:{label:'Kahneman & Lovallo，Timid Choices and Bold Forecasts（1993）',url:'https://doi.org/10.1287/mnsc.39.1.17'},
 x_heuristics:{label:'Tversky & Kahneman，Judgment under Uncertainty: Heuristics and Biases（1974）',url:'https://doi.org/10.1126/science.185.4157.1124'},
 x_helping:{label:'Darley & Batson，From Jerusalem to Jericho（1973）',url:'https://doi.org/10.1037/h0034449'},
 x_survivors:{label:'Denrell，Vicarious Learning, Undersampling of Failure, and the Myths of Management（2003；选择偏差的补充研究）',url:'https://doi.org/10.1287/orsc.14.2.227.15164'},
 x_small:{label:'Tversky & Kahneman，Belief in the Law of Small Numbers（1971）',url:'https://doi.org/10.1037/h0031322'},
 x_repetition:{label:'Hasher, Goldstein & Toppino，Frequency and the Conference of Referential Validity（1977）',url:'https://doi.org/10.1016/S0022-5371(77)80012-1'},
 x_expertise:{label:'Kahneman & Klein，Conditions for Intuitive Expertise: A Failure to Disagree（2009）',url:'https://doi.org/10.1037/a0016755'},
 x_outcome:{label:'Baron & Hershey，Outcome Bias in Decision Evaluation（1988）',url:'https://doi.org/10.1037/0022-3514.54.4.569'},
 x_focusing:{label:'Schkade & Kahneman，Does Living in California Make People Happy?（1998）',url:'https://doi.org/10.1111/1467-9280.00066'}
};
const EXTRA_TASKS = [
 {id:'own_gift',module:'owning',title:'两份礼物，你会拿哪一份？',form:'staged',context:'活动结束，你可以免费选一只全新马克杯或一本全新笔记本。两样东西你都能用上；款式与质量已经看清。',prompt:'还没有任何一件属于你时，你更想选？',firstOptions:[['cup','马克杯。'],['book','笔记本。'],['either','没有明确偏好。']],options:[['cup','留下马克杯。'],['book','换成笔记本。'],['either','仍没有明确偏好。']],stagePrompt:'听完工作人员的安排，你现在更想？',stageNote:'工作人员刚才按座位随机发礼物，已把马克杯赠给你。你还没使用它；现在可以当场免费换成刚才那本笔记本，不需解释，也没有排队、手续或人情负担。两件物品的条件都没变。',note:'首次选择会先封存，再展示后续安排；不比较谁更会选礼物。'},
 {id:'own_change',module:'owning',title:'同样一百元，两种第一感觉。',form:'halo',context:'分别想象两个彼此独立的情境。你原有的可自由支配余额相同；这笔变化不影响房租、还款和必要开支。请按自己预想的感受选择。',prompt:'这两种感受的强度，分别更接近？',fields:[{name:'gain',label:'意外多得到100元时，开心的程度',options:[['strong','比较强烈'],['middle','一般'],['weak','比较轻微'],['unknown','难以预想']]},{name:'loss',label:'意外少了100元时，懊恼的程度',options:[['strong','比较强烈'],['middle','一般'],['weak','比较轻微'],['unknown','难以预想']]}],note:'分别选择即可，两种感受不必一样。'},
 {id:'own_default',module:'owning',title:'提醒怎么收，你更舒服？',form:'staged',context:'一个模拟阅读应用提供两种免费提醒方式。你已经了解它们的区别；两种方式都能随时一键切换。',prompt:'先不考虑系统预设，你更想用？',firstOptions:[['instant','新内容到达时提醒。'],['digest','每天固定时间汇总提醒。'],['either','都可以。']],options:[['instant','新内容到达时提醒。'],['digest','每天固定时间汇总提醒。'],['either','都可以。']],stagePrompt:'现在页面给出了预设，你最终选？',stageNote:'应用的新用户页面预先勾选了“每天固定时间汇总”。这是所有新用户统一的预设，不是根据你的使用情况作出的推荐。切换不花钱，也不需要额外步骤。两种方式的功能没有变化。',note:'按自己的使用偏好选择，不把保留或修改预设视为对错。'},
 {id:'own_accounts',module:'owning',title:'这笔钱，适合用来犒劳自己吗？',form:'halo',context:'下面是两种独立情况。两种情况下，你目前的全部余额、未来收入和必要支出都相同；其中都有200元可自由支配，没有专门承诺的用途。你喜欢的周末展览票恰好200元。',prompt:'分别选出你更愿意怎么安排。',fields:[{name:'salary',label:'这200元被你记为“本月工资结余”',options:[['spend','买展览票，享受这个周末。'],['save','先留下，之后再安排。'],['either','没有明确倾向。']]},{name:'bonus',label:'这200元被你记为“临时活动奖金”',options:[['spend','买展览票，享受这个周末。'],['save','先留下，之后再安排。'],['either','没有明确倾向。']]}],note:'这里比较的是相同可用资金的不同标签，不比较不同人的收入或生活压力。'},
 {id:'own_portfolio',module:'owning',title:'这次小活动，你会批准吗？',form:'staged',context:'你负责社区活动。有一个小型试办提案：可能受到欢迎，也可能报名冷清。费用在团队能承受的试办额度内，但没有保证成功。',prompt:'只看这一次提案，你更倾向于？',firstOptions:[['try','愿意安排一次试办。'],['stop','不愿意承担这次可能的损失。'],['review','先明确效果、成本与停止条件。']],options:[['policy','先定整体试办规则，再按同一规则评估本次。'],['single','仍按每一次活动独立决定。'],['stop','这一阶段先不开展试办。']],stagePrompt:'换到年度安排层面，你更愿意怎样决定？',stageNote:'这类提案一年会遇到很多次。团队已有总试办预算，但尚未定统一规则；不同活动可能共享人员与场地，因此不能先假设所有风险都彼此独立。现在讨论的是如何安排这一组决策，不是保证多试几次就一定赚钱。',note:'先记下这一次的选择，之后再看年度安排。'},
 {id:'story_base',module:'portraits',title:'这张人物卡，来自哪个岗位？',form:'staged',context:'你从活动后台全部工作人员中随机抽到一张人物卡。她喜欢做视觉笔记，常整理展览照片。候选岗位只有现场协调与视觉设计；暂时不知道两类各有多少人。',stimulus:{kind:'quote',body:'“喜欢做视觉笔记，常整理展览照片。”'},prompt:'关于她的岗位，你现在更倾向于？',firstOptions:[['coord','现场协调。'],['design','视觉设计。'],['open','暂时拿不准。']],options:[['coord','现场协调更可能。'],['design','视觉设计更可能。'],['equal','两类同样可能。']],stagePrompt:'工作人员补充了下面的信息。现在你认为？',stageNote:'完整名单中，绝大多数人负责现场协调，少数人负责视觉设计。人物卡确实从全部名单等可能随机抽取。已知卡片上这种兴趣描述，在两类岗位中出现的比例完全一样。',note:'不用计算概率。先记下初步印象，再看名单背景。'},
 {id:'story_help',module:'portraits',title:'谁会停下来帮忙？',form:'staged',context:'两位报名者路过活动入口，那里有人需要帮忙搬开挡路的空纸箱。你还不知道他们当时的时间安排。下面是他们在报名表里的自我介绍。',stimulus:{kind:'compare',items:[{title:'阿澄',body:'“我喜欢热闹，也很愿意帮助别人。”'},{title:'小宁',body:'“我比较安静，习惯自己做事。”'}]},prompt:'你的第一倾向是？',firstOptions:[['cheng','阿澄更可能停下。'],['ning','小宁更可能停下。'],['open','仅凭自我介绍，我拿不准。']],options:[['cheng','我仍更倾向阿澄。'],['ning','我现在更倾向小宁。'],['open','时间安排提供了重要线索，但还不能确定谁会帮忙。']],stagePrompt:'知道他们当时的处境后，你的判断是？',stageNote:'阿澄正赶着在即将关闭的签到窗口报到；小宁已经完成报到，正在等活动开始。两人都看到了纸箱，也都具备帮忙的能力。我们没有为这个故事设定实际结果。',note:'这里只记录行为预测，不评选谁更善良。'},
 {id:'story_survivors',module:'portraits',title:'这些店主，都做对了同一件事？',form:'choice',context:'你读到一组“开店成功者访谈”。被采访的店都经营了很久，店主都说自己坚持独特装修、从不跟风。编辑没有采访已关门的店，也没说明其他店怎样装修。',stimulus:{kind:'quote',body:'“长期活下来的店，都有自己的坚持。”'},prompt:'如果要给准备开店的朋友转述，你会选？',options:[['copy','成功店都这样，独特装修就是一条可靠成功路径。'],['reverse','既然只采访成功者，那独特装修大概反而有害。'],['compare','这些经历可作线索；还要看相似做法在关门店与其他店里怎样出现。'],['ignore','成功者的经验没有任何参考价值。']],note:'所有店与访谈均为虚构，不构成经营建议。'},
 {id:'story_sequence',module:'portraits',title:'哪一串更像真正抽出来的？',form:'choice',context:'一个模拟抽签器每次独立抽出圆形或三角形，两种图形机会相同，抽完会放回。下面各是一串事先写定的完整八次记录。',stimulus:{kind:'compare',items:[{title:'记录A',body:'○ ○ ○ ○ △ △ △ △'},{title:'记录B',body:'○ △ ○ ○ △ ○ △ △'}]},prompt:'如果从头运行八次，恰好得到哪一串完整记录更可能？',options:[['a','记录A更可能。'],['b','记录B更可能。'],['same','这两串事先写定的完整记录同样可能。']],note:'比较的是这两串具体记录，不是“所有整齐记录”与“所有杂乱记录”两大类。无需计算数字。'},
 {id:'story_sample',module:'portraits',title:'哪一场的反馈更容易大起大落？',form:'choice',context:'同一款新饮品同时做两种小测试。每轮都重新从同一个稳定人群独立随机招募；这个人群里有人喜欢，也有人不喜欢。每人只答“喜欢”或“不喜欢”，互不商量。',stimulus:{kind:'compare',items:[{title:'小场',body:'每轮只邀请4人。'},{title:'大场',body:'每轮邀请40人。'}]},prompt:'长期重复时，哪种场次的“喜欢”比例更容易从一轮到下一轮明显波动？',options:[['small','小场更容易。'],['large','大场更容易。'],['same','人数不同，波动也一样。']],note:'比较反馈比例的波动，不比较两场饮品质量；不需要算百分比。'},
 {id:'intuition_repeat',module:'intuiting',title:'这句话，你已经见过好几遍。',form:'choice',context:'你正在看一个虚构街区的资讯。三个页面先后出现相同的营业消息，但都没有附书店的原始公告。',stimulus:{kind:'compare',items:[{title:'街区推荐页',body:'夜航鸟书店每周一休息。'},{title:'探店合集',body:'夜航鸟书店每周一休息。'},{title:'出行便签',body:'夜航鸟书店每周一休息。'}]},prompt:'此刻，你愿意怎样使用这条消息？',options:[['trust','好几处都这么说，我就按周一不开门来安排。'],['tentative','先作临时参考，出发前查书店自己的公告。'],['false','重复得太整齐，我认为消息一定不真实。']],note:'书店名称与营业消息均为虚构材料，不提供真实出行信息。'},
 {id:'intuition_expert',module:'intuiting',title:'两位都说：“我凭经验就知道。”',form:'halo',context:'你听到两种快速判断。先看他们怎样积累经验，再分别判断这些直觉有没有较好的学习基础。',stimulus:{kind:'compare',items:[{title:'设备检修员',body:'多年检修同一种设备；故障模式较稳定。判断后能拆机核对，持续记录判断与结果。'},{title:'潮流评论员',body:'多年预测“一年后哪个概念会流行”；市场变化快，结果标准常改，很少完整保存预测与落空记录。'}]},prompt:'你会怎样看待他们的直觉依据？',fields:[{name:'repair',label:'检修员的快速判断',options:[['basis','具备较好的学习条件，可作为判断依据之一。'],['doubt','这些经历尚不足以支持可靠直觉。'],['unknown','我拿不准。']]},{name:'trend',label:'评论员的长期趋势判断',options:[['basis','具备较好的学习条件，可作为判断依据之一。'],['doubt','这些经历尚不足以支持可靠直觉。'],['unknown','我拿不准。']]}],note:'不诊断真实设备，也不据此判断整个职业的人；仅比较题设中的学习条件。'},
 {id:'intuition_validity',module:'intuiting',title:'几位评审，都很有把握。',form:'choice',context:'评审们一起听完同一场生动的作品介绍，随后讨论并一致看好它明年的销量。他们都觉得人物定位与市场故事很完整。你没有看到他们过去预测销量的记录，也没有独立市场验证。',stimulus:{kind:'quote',body:'“几个人都这么有把握，这次应该八九不离十。”'},prompt:'你会怎样向负责发行的同事介绍这个判断？',options:[['certain','多人一致而且理由完整，可以把销量成功当作高把握前提。'],['useless','既然没有历史记录，这些人的专业知识全无价值。'],['separate','他们形成了共同看法；预测是否准确，还要看独立证据与以往记录。']],note:'这里区分评审意见的一致与预测能力，不要求猜作品实际会卖多少。'},
 {id:'intuition_outcome',module:'intuiting',title:'这次活动的准备，做得怎么样？',form:'staged',context:'活动负责人核对了当时可得的天气预报、场地条件与成本，并为户外读书会安排了可立即转入的室内空间。团队按约定标准认为剩余天气风险可接受，没有遗漏已知警报。',prompt:'只看决定时已知的资料，你怎样评价准备过程？',firstOptions:[['sound','过程考虑得较周全。'],['poor','过程考虑得不够好。'],['open','我还拿不准。']],options:[['sound','过程考虑得较周全。'],['poor','过程考虑得不够好。'],['open','我还拿不准。']],stagePrompt:'知道结果后，回到“当时的准备过程”，你现在评价？',stageNote:'当天突发的阵雨仍打断了开场。团队顺利转入室内，但有些参与者提前离开，体验不如预期。这次结果没有揭示准备时忽略的警报或额外可得资料；这些条件与第一步相同。',note:'首次评价会保留；第二次仍问准备过程，不问活动结果好不好。'},
 {id:'intuition_focus',module:'intuiting',title:'住到海边，日子会怎样？',form:'staged',context:'你看到一间面朝海湾、采光很好的公寓，想象自己搬进去生活。房租在预算内；暂时只看到了房间与风景。',stimulus:{kind:'quote',body:'每天睁眼，就能看到这片海。'},prompt:'想到搬进去以后的整体生活，你的第一感觉更接近？',firstOptions:[['better','整体生活会明显更愉快。'],['little','可能变化不大。'],['worse','整体生活可能更不方便。'],['open','现在还很难判断。']],options:[['better','整体生活会明显更愉快。'],['little','可能变化不大。'],['worse','整体生活可能更不方便。'],['open','现在还很难判断。']],stagePrompt:'把普通的一整天想完以后，你现在更接近？',stageNote:'请再想象：起床、买菜、通勤、工作、见朋友、做家务、睡觉。题目没有告诉你新住处的通勤、社交与日常便利条件，也没有设定它们比现在好或差。不要自行把未知条件当成坏消息。',note:'第二步是扩大注意范围；没有隐藏的房屋缺点或最终生活满意度答案。'}
];

function extraOptionText(options,value){return (options?.find(o=>o[0]===value)?.[1]||'未记录').replace(/。$/,'');}
function extraSelectedText(task,a){
 if(task.form==='halo')return task.fields.map(f=>`${f.label}：${extraOptionText(f.options,a[f.name])}`).join('；');
 if(task.form==='staged')return `起初：${extraOptionText(task.firstOptions,a.first)}；之后：${extraOptionText(task.options,a.value)}`;
 return extraOptionText(task.options,a.value);
}
function interpretExtraTask(id,answers={},meta={}){
 const task=EXTRA_TASKS.find(t=>t.id===id);if(!task)return null;
 const a=answers[id]||{};
 const certainty={low:'只是一个初步想法',medium:'比较倾向这个判断',high:'很有把握'};
 const result={id,answer:extraSelectedText(task,a),certainty:certainty[a.certainty],visual:null};
 const selected=()=>`你选择了“${extraOptionText(task.options,a.value)}”。`;
 const staged=()=>`起初你选择“${extraOptionText(task.firstOptions,a.first)}”；之后选择“${extraOptionText(task.options,a.value)}”。`;
 const set=(concept,title,body,method,limit,sources)=>Object.assign(result,{concept,title,body,method,limit,sources});
 if(id==='own_gift')set('禀赋效应与拥有的参照','东西没变，“已经是我的”可能改变比较。',[staged(),'研究中的禀赋效应涉及拥有一件物品后，对放弃它的评价如何改变。题设移除了使用痕迹与手续成本，但想象“已拥有”仍可能让留下与换走有不同感觉。',a.first==='book'&&a.value==='cup'?'这次你从更想要笔记本，变成了留下已获赠的杯子。这个变化值得回看；它也可能包含顺序、重新考虑或赠礼情境的影响。':a.first===a.value?'两次物品倾向一致，本次没有观察到物品选择的变化。':'你的记录可以用来比较拥有前后的倾向；不把任意一种改变都叫作禀赋效应。'],'先问：如果现在两样都不属于我，我会选哪样？再把真实交换成本单独列出。','这只是想象中的一次交换，不等同于真实持有与交易实验，也不估计你的禀赋效应强度。',['x_endowment','x_book']);
 if(id==='own_change'){
  const rank={weak:1,middle:2,strong:3};const comparable=a.gain in rank&&a.loss in rank;
  const relation=!comparable?'你有一项选择难以预想，因此不比较两项强弱。':rank[a.loss]>rank[a.gain]?'你预想的懊恼比开心更强。':rank[a.loss]===rank[a.gain]?'你给两种预想感受选择了相同的强度标签。':'你预想的开心比懊恼更强。';
  set('损失厌恶与参照点','“多一百”与“少一百”，未必是镜像感受。',[`${result.answer}。${relation}`,'损失厌恶讨论相对于参照点的损失与同等收益，对评价或选择可能产生不对称影响。它不是“任何损失都必定比收益更强”的普遍定律。'],'在得失之间作选择时，先明确自己把什么当作原来的状态。','开心与懊恼不是同一种心理标尺。两项想象感受不能测量经济学上的损失厌恶参数，也不等于一项风险选择实验。',['x_loss','x_book']);
 }
 if(id==='own_default')set('默认选项与现状','预先勾选，不等于已经替你选好了理由。',[staged(),'默认安排可能因为省事、像是推荐、或被当作已有状态而影响选择。本题说明它不是个性化建议，并移除了额外切换步骤；你仍可能本来就更喜欢汇总提醒。',a.first==='instant'&&a.value==='digest'?'你从即时提醒改选了页面预设的汇总提醒。这个方向与默认影响相容，但一次改变不能分离默认与重新思考。':a.first===a.value?'你的前后倾向一致。保留预设可能符合需求，改掉预设也可能符合需求。':'这里先保留两次记录，再比较需求是否改变；不把任意改选都解释为默认效应。'],'把预设临时遮住，先说出自己实际需要的功能。','单人先后作答无法建立默认的因果效应；默认、现状、切换成本与真实偏好也不是同一个概念。',['x_statusquo','x_book']);
 if(id==='own_accounts')set('心理账户','同一笔可用资金，名字可能先替它安排去处。',[`${result.answer}。`,a.salary===a.bonus?'你的两种安排一致；本次未观察到资金标签下的选择差异。':'两种标签下你给出了不同安排。按题设，可用资金与生活约束相同；可以回看“工资结余”与“奖金”是否承载了不同心理用途。','心理账户是人们对资金划分来源、用途与预算的方式。它会影响选择，也可能帮助执行储蓄与消费计划；不能一概视为不理性。'],'检查钱的来源标签之外，当前余额、承诺用途与未来需要是否真的不同。','这不是消费或储蓄建议。想象中的不同安排不能证明你现实中会违背自己的财务目标。',['x_accounting','x_book']);
 if(id==='own_portfolio')set('窄框架与整体决策','一笔笔问“怕不怕亏”，与先定一套规则不同。',[staged(),'窄框架是把决策孤立看待，忽略它与其他机会、总资源和整体目标的联系。把一组机会放在一起看，可能改变风险的意义，但不会自动消除风险。','第二步新增了年度预算与机会之间可能相关的条件。改变安排可以是对新信息的合理反应，不能当作偏好被纯粹措辞翻转。'],'先定总预算、单次上限、停止条件，再检查各次风险是否相关。','并非机会越多越该冒险。有限资源、共同风险或一次损失的严重后果，都可能使谨慎选择合理。',['x_broad','x_book']);
 if(id==='story_base')set('基率与代表性','像不像那个岗位，与抽中谁是两件事。',[staged(),'后来给出的条件很关键：现场协调人员更多，而这种兴趣在两类岗位同样常见。兴趣描述没有把可能性额外推向视觉设计；在这些完整条件下，现场协调更可能。','这是关于随机抽取的一张卡的判断，不是在评价现实中哪种人应该做哪份工作。'],'先看从谁之中抽取，再问人物线索在两组里是否真的出现得不同。','第一步缺少名单与线索有效性，不能凭初选判错。第二步的比较依赖等可能抽取与相同兴趣比例；现实中不能不加核实地套用。',['x_heuristics','x_book']);
 if(id==='story_help')set('情境与行为归因','一个人的简介，没有写完当时的处境。',[staged(),'自我介绍容易形成稳定的人物印象，时间压力却属于行为发生时的情境。在原始帮助行为研究的特定条件下，是否匆忙影响了停下帮助的情况；这个虚构故事没有公布谁真的帮了忙。','情境线索提醒我们扩大解释范围，不意味着性格永远无关，也不能据此断定小宁一定停下、阿澄一定走开。'],'预测具体行为时，同时问：这个人当时有哪些时间压力、机会与限制？','题中新增了有效情境信息，因此改选可以是合理更新。不能从一次预测推断你是否常把行为归因于性格。',['x_helping','x_book']);
 if(id==='story_survivors')set('幸存者偏差与选择过程','故事可能都是真的，样本却只剩留下来的。',[selected(),'只采访长期经营的店，无法知道同样做法在失败者中是否也很常见。即使每段访谈都属实，筛选过程仍可能让一种做法看起来比实际更可靠。','补上关门店与其他店，是为了看清比较范围；它既不证明独特装修有效，也不证明独特装修有害。'],'读成功方法前先问：谁没有进入这组故事？同样的做法在他们那里怎样？','本题不估计经营效应。补充研究讨论对失败的不足取样，不意味着所有成功经验都不可用。',['x_survivors','x_book']);
 if(id==='story_sequence')set('随机性与局部图案','随机过程，也会留下看起来不随机的一串。',[selected(),'两串都是提前指定的八次完整结果。题设的每一步机会相同且独立，所以恰好得到记录A与恰好得到记录B的机会相同；整齐的片段不会因此被排除。','这里不是说“所有整齐图案”与“所有杂乱图案”的总机会相同。把许多具体序列合成一大类以后，类里包含多少种序列也会影响比较。'],'先说清比较对象：某一串具体记录，还是包含很多串的一类模式？','该结论依赖公平、独立与事先指定。现实数据可能有关联或抽取规则变化，不能看见任何图案都说只是巧合。',['x_heuristics','x_small']);
 if(id==='story_sample')set('小样本与比例波动','人少时，几个人就能改写整场印象。',[selected(),'在同一稳定人群中独立随机招募，小场的喜欢比例更容易大幅波动。一次全喜欢既可能来自真实偏好，也更容易包含抽取偶然性；大场也不保证完全代表人群。','增加人数降低这类随机波动，不会自动修复只找熟人、只保留好评或诱导提问等选样问题。'],'看到“大家都喜欢”时，先问邀请了多少人、怎样招募，以及有没有重复测试。','结论依赖相同人群与独立随机招募。这里没有推出某一次好评一定不真实，也没有给个人统计能力打分。',['x_small','x_book']);
 if(id==='intuition_repeat')set('重复、熟悉感与认知轻松','听着耳熟，尚未多出一份原始证据。',[selected(),'重复出现的句子可能更容易加工，也可能显得更可信。原始研究考察了重复陈述如何改变真伪判断；这次短暂阅读并未复现其时间间隔与实验条件。','三个页面可能都转用了同一条消息；本题没有说明它们是否独立核实。重复不证明消息真实，也不证明消息虚假。'],'区分“我见过好几次”与“有几份独立核实的证据”，再找原始来源。','无法根据你的一个选项确认重复已经影响判断。本题没有设定营业消息的真值，也不利用虚构店名测试事实知识。',['x_repetition','x_book']);
 if(id==='intuition_expert')set('专家直觉的条件','经验有多久，还要看经验怎样得到反馈。',[`${result.answer}。`,'题设中的检修员反复接触较稳定的模式，并能拆机核对，具有学习直觉的重要条件。评论员的长期预测缺少稳定标准与完整反馈，仅凭年资与自信不足以确认预测技能。','卡尼曼与克莱因共同强调：环境中要有可学的规律，也要有足够机会与反馈来学会它。再强的熟悉感也不能替代这些条件。'],'问三件事：规律够稳定吗？练习相关吗？结果反馈及时而清楚吗？','有学习基础不保证这一次判断正确。职业名称本身不是可靠性标签，题设结论不能推广到所有检修员或评论员。',['x_expertise','x_book']);
 if(id==='intuition_validity')set('有效性错觉','意见很一致，预测能力却还没有被检验。',[selected(),'一个故事容易解释、许多人同意，可能带来很强的有效感。但评审们接触同一介绍并共同讨论，不能把他们的共识当作多份互不相关的市场检验。','我们尚不知道他们的历史预测表现与作品的真实前景。共识可以记录，专业意见可以参考；准确性需要与结果核对，也需要独立证据。'],'在结果揭晓前保存预测、理由与判断标准，之后完整核对成功和落空的记录。','本题没有证明评审预测一定错误，也不把你的选项当作过度自信程度。与光环不同，此处重点是主观有效感与实际预测有效性的区别。',['x_expertise','x_book']);
 if(id==='intuition_outcome')set('结果偏差','结果不理想，不会自动改写当时知道的事。',[staged(),a.first===a.value?'你对准备过程的评价保持一致。这个记录不代表结果不值得复盘。':'你对准备过程的评价发生变化。可以检查变化来自结果本身，还是你重新看到了第一步里已有的不足。','结果偏差讨论人们如何用后来成败评价先前的决策质量。这里保留了相同的决策时信息：坏结果说明体验受损，但没有自动证明当时漏做了可行准备。'],'复盘分开写：当时掌握的信息与可选方案、实际结果，以及是否发现了当时本可知道的新线索。','结果能够提示检查假设、更新以后的流程。这里不主张忽略后果，也不按你是否改选判定结果偏差；它与“回忆当时预测”的事后偏见不同。',['x_outcome','x_book']);
 if(id==='intuition_focus')set('聚焦错觉','海景很显眼，生活还会继续发生在别处。',[staged(),'想象变化时，被聚焦的特点可能占据比实际日常更大的位置。第二步没有提供坏消息，只是把注意力从海景扩展到普通的一整天。',a.first===a.value?'你的整体倾向保持一致。海景也可能确实对你很重要；不需要为了证明某种效应而改选。':'你的整体倾向发生了变化。它可能与注意范围扩大有关，也可能是重新思考；没有真实生活记录，不能判定哪次更准确。'],'在特别吸引人的特点之外，过一遍普通工作日与普通休息日，再比较。','聚焦错觉不表示风景、收入或居住条件对生活没有作用。本题没有完整生活条件与未来满意度，不能测量你的聚焦程度。',['x_focusing','x_book']);
 return result;
}

MODULES.push(...EXTRA_MODULES); TASKS.push(...EXTRA_TASKS); Object.assign(SOURCES,EXTRA_SOURCES);
if(typeof module!=='undefined')module.exports={CONTENT_VERSION,MODULES,TASKS,SOURCES,CERTAINTY,EVIDENCE_CARDS,CARD_OPTIONS,tasksForModules,revealPagesForModules,selectedText,cardRuleValid,interpretTask};
