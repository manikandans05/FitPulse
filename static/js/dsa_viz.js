const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function post(url, body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Operation failed');return d;}

$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab,.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');const panel=$('#'+b.dataset.tab);panel.classList.add('active');$('#page-crumb').textContent=panel.querySelector('h2').textContent;});

function renderLinked(items){$('#llVisual').innerHTML=items.map(x=>`<div class="node">${x}</div>`).join('')+(items.length?'<b>None</b>':'<i>Empty list</i>');}
async function linked(action){try{const d=await post('/api/dsa/linked-list',{action,value:$('#llValue').value});renderLinked(d.items);$('#llStatus').textContent=typeof d.result==='object'?JSON.stringify(d.result):d.result;}catch(e){$('#llStatus').textContent=e.message;}}
$$('[data-ll]').forEach(b=>b.onclick=()=>linked(b.dataset.ll));renderLinked(['Running','Cycling','Yoga']);

function renderStack(items){$('#stackVisual').innerHTML=items.map(x=>`<div class="stack-item">${x}</div>`).join('')||'<i>Empty stack</i>';}
async function stack(action){try{const d=await post('/api/dsa/stack',{action,value:$('#stackValue').value});renderStack(d.items);$('#stackStatus').textContent=d.result??'Stack is empty';}catch(e){$('#stackStatus').textContent=e.message;}}
$$('[data-stack]').forEach(b=>b.onclick=()=>stack(b.dataset.stack));renderStack(['Warm-up','Cardio']);

function renderQueue(items){$('#queueVisual').innerHTML=items.map(x=>`<div class="queue-node">${x}</div>`).join('')||'<i>Empty queue</i>';}
async function queue(action){try{const d=await post('/api/dsa/queue',{action,value:$('#queueValue').value});renderQueue(d.items);$('#queueStatus').textContent=d.result??'Queue is empty';}catch(e){$('#queueStatus').textContent=e.message;}}
$$('[data-queue]').forEach(b=>b.onclick=()=>queue(b.dataset.queue));renderQueue(['Running','Cycling','Yoga']);

$$('[data-tree]').forEach(b=>b.onclick=async()=>{const d=await post('/api/dsa/tree',{action:b.dataset.tree});$$('.tree-node').forEach(n=>n.classList.remove('hit'));const built=[];for(const value of d.sequence){const n=$(`[data-node="${value}"]`);n.classList.add('hit');built.push(value);$('#treeStatus').textContent=`${d.action}: ${built.join(' → ')}`;await sleep(500);n.classList.remove('hit');}});

const graphPositions=window.GRAPH_POSITIONS;
function renderGraph(prefix='graph'){
  const graph=window.GRAPH_DATA;
  const names=Object.keys(graph);
  const edges=$(`#${prefix}Edges`);
  edges.replaceChildren();
  const seen=new Set();
  names.forEach(source=>graph[source].forEach(target=>{
    const key=[source,target].sort().join('|');
    if(seen.has(key))return;
    seen.add(key);
    const [x1,y1]=graphPositions[source]||[320,180];
    const [x2,y2]=graphPositions[target]||[320,180];
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2);
    line.dataset.source=source;line.dataset.target=target;line.classList.add('graph-edge');
    edges.append(line);
  }));
  const nodes=$(`#${prefix}Nodes`);nodes.replaceChildren();
  names.forEach(name=>{
    const [x,y]=graphPositions[name]||[320,180];
    const node=document.createElement('div');
    node.className='graph-node';node.dataset.graphNode=name;node.style.left=`${x/640*100}%`;node.style.top=`${y/360*100}%`;node.textContent=name;
    nodes.append(node);
  });
  if(prefix!=='graph')return;
  const adjacency=$('#adjacencyList');adjacency.replaceChildren();
  names.forEach(name=>{
    const row=document.createElement('div');row.className='adj-row';row.dataset.adjNode=name;
    const label=document.createElement('strong');label.textContent=name;
    const neighbors=document.createElement('div');neighbors.className='adj-neighbors';
    graph[name].forEach(neighbor=>{const chip=document.createElement('span');chip.textContent=neighbor;neighbors.append(chip);});
    row.append(label,neighbors);adjacency.append(row);
  });
}
function renderBfsQueue(queue){
  const target=$('#bfsQueue');target.replaceChildren();
  if(!queue.length){const empty=document.createElement('span');empty.className='queue-empty';empty.textContent='Queue is empty';target.append(empty);return;}
  queue.forEach((name,index)=>{
    const item=document.createElement('span');item.className='queue-item';item.textContent=name;
    if(index===0)item.classList.add('queue-front');
    target.append(item);
  });
}
function renderBfsOrder(order){
  const target=$('#bfsOrder');target.replaceChildren();
  if(!order.length){const empty=document.createElement('span');empty.className='queue-empty';empty.textContent='Your traversal will appear here.';target.append(empty);return;}
  order.forEach((name,index)=>{
    if(index){const arrow=document.createElement('span');arrow.className='order-arrow';arrow.textContent='→';target.append(arrow);}
    const item=document.createElement('span');item.className='order-item';item.textContent=name;target.append(item);
  });
}
renderGraph();
$('#runBfs').onclick=async()=>{
  const button=$('#runBfs');button.disabled=true;
  const queue=[];const discovered=new Set();const visited=[];const treeEdges=[];
  $$('#graph .graph-node,#graph .graph-edge,#graph .adj-row').forEach(el=>el.classList.remove('visited','current','frontier','discovered'));
  renderBfsQueue([]);renderBfsOrder([]);$('#graphStatus').textContent='Starting breadth-first search…';
  try{
    const start=$('#graphStart').value;
    const d=await post('/api/dsa/graph',{start});
    queue.push(start);discovered.add(start);renderBfsQueue(queue);
    for(const name of d.sequence){
      queue.shift();
      visited.push(name);
      const additions=d.edges.filter(([parent])=>parent===name).map(([,child])=>child);
      additions.forEach(child=>{queue.push(child);discovered.add(child);treeEdges.push([name,child]);});
      $$('#graph .graph-node,#graph .graph-edge,#graph .adj-row').forEach(el=>el.classList.remove('current','frontier'));
      const current=$(`#graph [data-graph-node="${name}"]`);current.classList.add('visited','current');
      discovered.forEach(value=>{const node=$(`#graph [data-graph-node="${value}"]`);if(!node.classList.contains('visited'))node.classList.add('frontier');});
      treeEdges.forEach(([source,target])=>{
        const edge=$$('#graphEdges line').find(line=>(line.dataset.source===source&&line.dataset.target===target)||(line.dataset.source===target&&line.dataset.target===source));
        if(edge)edge.classList.add('discovered');
      });
      $(`[data-adj-node="${name}"]`).classList.add('current');
      renderBfsQueue(queue);renderBfsOrder(visited);
      $('#bfsStep').textContent=`Step ${visited.length} / ${d.sequence.length}`;
      $('#graphStatus').textContent=`Dequeue ${name}${additions.length?`; enqueue ${additions.join(', ')}`:'; no new neighbors'}.`;
      await sleep(650);
    }
    $('#bfsStep').textContent='Complete';
    $('#graphStatus').textContent=`BFS complete: ${visited.join(' → ')}`;
  }catch(error){$('#bfsStep').textContent='Error';$('#graphStatus').textContent=error.message;}
  finally{button.disabled=false;}
};

function textElement(tag, className, text){
  const element=document.createElement(tag);
  element.className=className;
  element.textContent=text;
  return element;
}
function setBusy(panel, busy){
  panel.querySelectorAll('input,button,select').forEach(control=>control.disabled=busy);
  panel.setAttribute('aria-busy',String(busy));
}
function linearItems(){
  const items=$('#linearItems').value.split(',').map(value=>value.trim()).filter(Boolean);
  if(items.length>40||items.some(value=>value.length>80))throw new Error('Use up to 40 workouts, each at most 80 characters.');
  return items;
}
function renderSearch(items, inserted=-1){
  const visual=$('#linearVisual');visual.replaceChildren();
  items.forEach((value,index)=>{
    const node=textElement('div','search-node',value);
    node.title=`Index ${index}`;
    node.dataset.searchIndex=index;
    if(index===inserted)node.classList.add('hit');
    visual.append(node);
  });
  if(!items.length)visual.append(textElement('span','queue-empty','Empty list'));
}
renderSearch(linearItems());
$('#linearItems').oninput=()=>{
  try{renderSearch(linearItems());$('#linearStatus').textContent='';}
  catch(error){$('#linearStatus').textContent=error.message;}
};
$('#insertLinear').onclick=()=>{
  try{
    const items=linearItems();
    const value=$('#linearValue').value.trim();
    const rawPosition=$('#linearPosition').value;
    const position=rawPosition===''?items.length:Number(rawPosition);
    if(!value||value.includes(',')||value.length>80)throw new Error('Enter one workout, at most 80 characters, without commas.');
    if(!Number.isInteger(position)||position<0||position>items.length)throw new Error(`Choose an index from 0 to ${items.length}.`);
    if(items.length>=40)throw new Error('The list is full (40 workouts).');
    items.splice(position,0,value);
    $('#linearItems').value=items.join(',');renderSearch(items,position);
    $('#linearStatus').textContent=`Inserted ${value} at index ${position}; ${items.length-position-1} items shifted right.`;
    $('#linearValue').value='';
  }catch(error){$('#linearStatus').textContent=error.message;}
};
$('#runLinear').onclick=async()=>{
  const panel=$('#linear');setBusy(panel,true);
  try{
    const items=linearItems();renderSearch(items);
    const result=await post('/api/dsa/linear-search',{items,target:$('#linearTarget').value});
    for(const step of result.steps){
      const node=$(`[data-search-index="${step.index}"]`);
      node.classList.add(step.matched?'hit':'miss');
      $('#linearStatus').textContent=`Checking index ${step.index}: ${step.value}`;
      await sleep(500);
    }
    $('#linearStatus').textContent=result.found?`Found ${result.value} at index ${result.index}`:'Target not found';
  }catch(error){$('#linearStatus').textContent=error.message;}
  finally{setBusy(panel,false);}
};

function activityItems(input){
  if(!input.value.trim())return [];
  const parts=input.value.split(',').map(value=>value.trim());
  if(parts.length>20||parts.some(value=>!value||value.length>80)){
    throw new Error('Use up to 20 comma-separated activities, each 1-80 characters.');
  }
  return parts;
}
function renderArray(container, items, frame={}){
  container.replaceChildren();
  items.forEach((value,index)=>{
    const cell=textElement('div','array-cell','');
    if(frame.active?.includes(index))cell.classList.add('is-active');
    if(frame.done||(frame.matched&&frame.middle===index))cell.classList.add('is-done');
    if(frame.low!==undefined&&(index<frame.low||index>frame.high))cell.classList.add('is-excluded');
    const markers=[];
    if(index===frame.low)markers.push('LOW');
    if(index===frame.middle)markers.push('MID');
    if(index===frame.high)markers.push('HIGH');
    cell.append(textElement('span','array-marker',markers.join(' / ')),textElement('strong',value.length>60?'array-value long-activity':'array-value',value),textElement('small','array-index',`Index ${index}`));
    container.append(cell);
  });
  if(!items.length)container.append(textElement('span','queue-empty','Empty array'));
}
function createPlayback(panel, showFrame, reset){
  let frames=[],cursor=0,timer=null,playing=false;
  const control=name=>panel.querySelector(`[data-playback="${name}"]`);
  function update(){
    control('play').textContent=playing?'Pause':'Play';
    control('play').disabled=frames.length<2;
    control('back').disabled=!frames.length||cursor===0;
    control('next').disabled=!frames.length||cursor===frames.length-1;
    panel.querySelector('.step-count').textContent=frames.length?`${cursor+1} / ${frames.length}`:'Ready';
  }
  function pause(){clearTimeout(timer);playing=false;update();}
  function tick(){
    if(cursor>=frames.length-1){pause();return;}
    timer=setTimeout(()=>{cursor++;showFrame(frames[cursor]);update();tick();},Number(panel.querySelector('.step-speed').value));
  }
  function play(){
    if(!frames.length)return;
    if(cursor===frames.length-1){cursor=0;showFrame(frames[cursor]);}
    playing=true;update();tick();
  }
  function clear(){pause();frames=[];cursor=0;update();}
  control('play').onclick=()=>playing?pause():play();
  control('back').onclick=()=>{pause();if(cursor>0){cursor--;showFrame(frames[cursor]);update();}};
  control('next').onclick=()=>{pause();if(cursor<frames.length-1){cursor++;showFrame(frames[cursor]);update();}};
  control('reset').onclick=()=>{clear();reset();};
  $$('.tab').forEach(tab=>tab.addEventListener('click',pause));
  return {clear,load(nextFrames){clear();frames=nextFrames;showFrame(frames[0]);play();}};
}

$$('.algorithm-panel').forEach(panel=>{
  const key=panel.id;
  const input=panel.querySelector('.activity-items');
  const visual=$(`#${key}Visual`),detail=$(`#${key}Detail`),status=$(`#${key}Status`);
  function showFrame(frame){
    renderArray(visual,frame.items,frame);detail.replaceChildren();
    if(frame.left)detail.append(textElement('span','buffer-values',`Left buffer: ${frame.left.join(', ')||'empty'}`),textElement('span','buffer-values',`Right buffer: ${frame.right.join(', ')||'empty'}`));
    if(frame.key!==undefined)detail.append(textElement('span','held-value',`Held activity: ${frame.key}`));
    status.textContent=frame.message;
  }
  function reset(){
    detail.replaceChildren();status.textContent='';
    try{renderArray(visual,activityItems(input));}catch(error){status.textContent=error.message;}
  }
  const player=createPlayback(panel,showFrame,reset);
  input.oninput=()=>{player.clear();reset();};
  if(key==='binary')$('#binaryTarget').oninput=()=>{player.clear();reset();};
  reset();
  panel.querySelector('.run-algorithm').onclick=async()=>{
    player.clear();setBusy(panel,true);
    let frames;
    try{
      const items=activityItems(input),body={items};
      if(key==='binary'){
        const target=$('#binaryTarget').value.trim();
        if(!target||target.length>80||target.includes(','))throw new Error('Enter one activity to search (1-80 characters).');
        body.target=target;
      }
      const result=await post(`/api/dsa/${panel.dataset.algorithm}`,body);
      frames=[{items:key==='binary'?result.items:items,message:key==='binary'?'Activities sorted A-Z; indices refer to this sorted array':'Initial activities'},...result.steps];
      if(key==='binary')frames.push({items:result.items,active:result.found?[result.index]:[],matched:result.found,middle:result.index,message:result.found?`Found ${body.target} at sorted index ${result.index}`:`${body.target} not found`});
      else frames[frames.length-1].done=true;
    }catch(error){status.textContent=error.message;}
    finally{setBusy(panel,false);player.clear();}
    if(frames)player.load(frames);
  };
});

function renderHeap(items, active){
  const tree=$('#heapTree');tree.replaceChildren();
  const bottomLevel=Math.floor(Math.log2(Math.max(items.length,1)));
  tree.style.minWidth=`${Math.max(320,2**bottomLevel*110)}px`;
  $('#heapCount').textContent=`${items.length} / 15`;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 880 350');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');tree.append(svg);
  const positions=items.map((item,index)=>{
    const level=Math.floor(Math.log2(index+1));
    return {left:(index-(2**level-1)+0.5)/2**level*880,top:38+level*88};
  });
  items.forEach((item,index)=>{
    const position=positions[index];
    if(index){
      const parent=positions[Math.floor((index-1)/2)];
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      Object.entries({x1:parent.left,y1:parent.top,x2:position.left,y2:position.top}).forEach(([name,value])=>line.setAttribute(name,value));svg.append(line);
    }
    const node=textElement('div','heap-node','');
    node.style.left=`${position.left/880*100}%`;node.style.top=`${position.top}px`;
    if(item[1]===active)node.classList.add('is-active');
    node.append(textElement('strong','heap-name',item[2]),textElement('span','heap-priority',`Priority ${item[0]}`));
    node.title=`${item[2]} | priority ${item[0]} | arrival ${item[1]+1}`;
    tree.append(node);
  });
  if(!items.length)tree.append(textElement('span','heap-empty','Heap is empty'));
  const array=$('#heapArray');array.replaceChildren();
  items.forEach((item,index)=>{
    const cell=textElement('div','heap-array-item',`[${index}] ${item[2]} | P${item[0]}`);
    if(item[1]===active)cell.classList.add('is-active');
    array.append(cell);
  });
  if(!items.length)array.append(textElement('span','queue-empty','Empty array'));
}
function renderProcessed(items){
  const list=$('#heapProcessed');list.replaceChildren();
  items.forEach(item=>list.append(textElement('li','processed-item',`${item[2]} (priority ${item[0]})`)));
}
async function heapOperation(action){
  const panel=$('#heap');setBusy(panel,true);
  try{
    const result=await post('/api/dsa/heap',{action,value:$('#heapValue').value,priority:Number($('#heapPriority').value)});
    if(action!=='peek')renderProcessed([]);
    for(const step of result.steps){
      renderHeap(step.items,step.active);
      if(step.processed)renderProcessed(step.processed);
      $('#heapStatus').textContent=step.message;
      await sleep(500);
    }
    renderHeap(result.items,action==='peek'?result.items[0]?.[1]:undefined);
    if(action!=='peek')renderProcessed(result.processed);
    $('#heapStatus').textContent=result.steps.length?`${result.steps[result.steps.length-1].message}. ${result.message}`:result.message;
    if(action==='insert')$('#heapValue').value='';
  }catch(error){$('#heapStatus').textContent=error.message;}
  finally{setBusy(panel,false);}
}
$$('[data-heap]').forEach(button=>button.onclick=()=>heapOperation(button.dataset.heap));
renderHeap([]);heapOperation('view');

function setupGreedy(){
  const panel=$('#greedy'),start=$('#greedyStart'),goal=$('#greedyGoal');
  let heuristics={};
  renderGraph('greedy');
  function renderSequence(selector,items,empty){
    const container=$(selector);container.replaceChildren();
    items.forEach((name,index)=>{
      if(index)container.append(textElement('span','order-arrow','→'));
      container.append(textElement('span','order-item',name));
    });
    if(!items.length)container.append(textElement('span','queue-empty',empty));
  }
  function showFrame(frame){
    $$('#greedyNodes .graph-node').forEach(node=>{
      const name=node.dataset.graphNode;
      node.classList.toggle('visited',frame.visited.includes(name));
      node.classList.toggle('frontier',frame.frontier.includes(name));
      node.classList.toggle('current',frame.current===name);
      node.classList.toggle('on-path',frame.path.includes(name));
      node.classList.toggle('is-goal',name===goal.value);
      node.replaceChildren(textElement('strong','greedy-activity',name),textElement('small','greedy-score',`h = ${heuristics[name]}${name===goal.value?' · GOAL':''}${name===start.value?' · START':''}`));
      node.title=`${name}: estimated map distance ${heuristics[name]} to ${goal.value}`;
    });
    $$('#greedyEdges line').forEach(line=>{
      const connects=(source,target)=>(line.dataset.source===source&&line.dataset.target===target)||(line.dataset.source===target&&line.dataset.target===source);
      line.classList.toggle('discovered',frame.edges.some(([source,target])=>connects(source,target)));
      line.classList.toggle('on-path',frame.path.some((name,index)=>index>0&&connects(frame.path[index-1],name)));
    });
    const frontier=$('#greedyFrontier');frontier.replaceChildren();
    frame.frontier.forEach((name,index)=>{
      const isNext=index===0&&!frame.done;
      const item=textElement('li',isNext?'greedy-candidate next-candidate':'greedy-candidate','');
      item.append(textElement('strong','',name),textElement('span','',`h = ${heuristics[name]}${isNext?' · NEXT':''}`));frontier.append(item);
    });
    if(!frame.frontier.length)frontier.append(textElement('li','queue-empty','Empty frontier'));
    renderSequence('#greedyVisited',frame.visited,'No activities visited');
    renderSequence('#greedyPath',frame.path,frame.done?'No path found':'Pending');
    $('#greedyStatus').textContent=frame.message;
  }
  function reset(){
    const target=graphPositions[goal.value];
    heuristics=Object.fromEntries(Object.entries(graphPositions).map(([name,position])=>[name,Math.round(Math.hypot(position[0]-target[0],position[1]-target[1]))/10]));
    showFrame({current:null,visited:[],frontier:[start.value],edges:[],path:[],done:false,message:'Ready'});
  }
  const player=createPlayback(panel,showFrame,reset);
  start.onchange=goal.onchange=()=>{player.clear();reset();};
  $('#runGreedy').onclick=async()=>{
    player.clear();reset();setBusy(panel,true);
    let result;
    try{result=await post('/api/dsa/greedy-search',{start:start.value,goal:goal.value});heuristics=result.heuristics;}
    catch(error){$('#greedyStatus').textContent=error.message;}
    finally{setBusy(panel,false);player.clear();}
    if(result)player.load(result.steps);
  };
  reset();
}
setupGreedy();
