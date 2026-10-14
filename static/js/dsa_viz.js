const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function post(url, body){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Operation failed');return d;}

$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab,.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.tab).classList.add('active');$('#page-crumb').textContent=({linked:'Linked List',stack:'Stack',queue:'Queue',tree:'Binary Tree',graph:'Graph BFS',linear:'Linear Search'})[b.dataset.tab];});

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

const graphPositions={Running:[320,44],Cycling:[500,112],Swimming:[500,248],Strength:[320,316],Yoga:[140,248],Walking:[140,112]};
function renderGraph(){
  const graph=window.GRAPH_DATA;
  const names=Object.keys(graph);
  const edges=$('#graphEdges');
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
  const nodes=$('#graphNodes');nodes.replaceChildren();
  names.forEach(name=>{
    const [x,y]=graphPositions[name]||[320,180];
    const node=document.createElement('div');
    node.className='graph-node';node.dataset.graphNode=name;node.style.left=`${x/640*100}%`;node.style.top=`${y/360*100}%`;node.textContent=name;
    nodes.append(node);
  });
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
  $$('.graph-node,.graph-edge,.adj-row').forEach(el=>el.classList.remove('visited','current','frontier','discovered'));
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
      $$('.graph-node,.graph-edge,.adj-row').forEach(el=>el.classList.remove('current','frontier'));
      const current=$(`[data-graph-node="${name}"]`);current.classList.add('visited','current');
      discovered.forEach(value=>{const node=$(`[data-graph-node="${value}"]`);if(!node.classList.contains('visited'))node.classList.add('frontier');});
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

function renderSearch(items){$('#linearVisual').innerHTML=items.map((x,i)=>`<div class="search-node" data-search-index="${i}">${i}: ${x}</div>`).join('');}renderSearch(['Running','Cycling','Yoga','Swimming','Walking']);
$('#runLinear').onclick=async()=>{const items=$('#linearItems').value.split(',').map(x=>x.trim()).filter(Boolean);renderSearch(items);const d=await post('/api/dsa/linear-search',{items,target:$('#linearTarget').value});for(const step of d.steps){const n=$(`[data-search-index="${step.index}"]`);n.classList.add(step.matched?'hit':'miss');$('#linearStatus').textContent=`Checking index ${step.index}: ${step.value}`;await sleep(500);}$('#linearStatus').textContent=d.found?`Found ${d.value} at index ${d.index}`:'Target not found';};
