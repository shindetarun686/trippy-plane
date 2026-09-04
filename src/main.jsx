import React, {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const W=1100,H=650;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);

function drawPlane(ctx,p,t){
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.angle);
  ctx.shadowBlur=16; ctx.shadowColor="rgba(80,220,255,.7)";
  // engine glow
  ctx.fillStyle="rgba(255,170,70,.8)"; ctx.beginPath(); ctx.ellipse(-31,7,18,6,0,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  // tail
  ctx.fillStyle="#f4f7ff"; ctx.beginPath(); ctx.moveTo(-27,1);ctx.lineTo(-47,-13);ctx.lineTo(-39,7);ctx.lineTo(-50,20);ctx.lineTo(-25,13);ctx.closePath();ctx.fill();
  // wing
  ctx.fillStyle="#9edcff";ctx.beginPath();ctx.moveTo(-4,3);ctx.lineTo(7,28);ctx.lineTo(27,26);ctx.lineTo(15,3);ctx.closePath();ctx.fill();
  // body
  ctx.fillStyle="#fff";ctx.beginPath();ctx.ellipse(0,0,34,12,0,0,Math.PI*2);ctx.fill();
  // nose
  ctx.fillStyle="#eaf2ff";ctx.beginPath();ctx.moveTo(26,-8);ctx.quadraticCurveTo(43,0,26,8);ctx.closePath();ctx.fill();
  // cockpit
  ctx.fillStyle="#2263b8";ctx.beginPath();ctx.ellipse(9,-7,12,7,-.2,0,Math.PI*2);ctx.fill();
  // propeller
  const a=t*0.035; ctx.strokeStyle="#fff";ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(39+Math.cos(a)*12,-Math.sin(a)*12);ctx.lineTo(39-Math.cos(a)*12,Math.sin(a)*12);ctx.stroke();
  ctx.restore();
}

function GameCanvas({onOver,onScore,best}){
  const ref=useRef(null), state=useRef(null);
  const [started,setStarted]=useState(false);
  useEffect(()=>{
    const c=ref.current,ctx=c.getContext("2d");
    let dpr=Math.min(devicePixelRatio||1,2);
    function resize(){const r=c.getBoundingClientRect();c.width=r.width*dpr;c.height=r.height*dpr;ctx.setTransform(dpr*r.width/W,0,0,dpr*r.height/H,0,0)}
    resize(); addEventListener("resize",resize);
    const s=state.current={plane:{x:210,y:300,vy:0,angle:0},obs:[],parts:[],stars:[],score:0,best,run:false,t:0,spawn:0,world:0};
    function reset(){s.plane={x:210,y:H/2,vy:0,angle:0};s.obs=[];s.parts=[];s.stars=[];s.score=0;s.t=0;s.spawn=0;s.world=0;s.run=true;setStarted(true)}
    function flap(){
      if(!s.run){reset(); return}
      s.plane.vy=-8.2;
      for(let i=0;i<7;i++)s.parts.push({x:s.plane.x-28,y:s.plane.y+7,vx:rnd(-3,-1),vy:rnd(-1.5,1.5),life:1});
    }
    function key(e){if(e.code==="Space"){e.preventDefault();flap()} if(e.code==="KeyR"&&!s.run)reset()}
    addEventListener("keydown",key); c.addEventListener("pointerdown",e=>{e.preventDefault();flap()});
    let raf;
    function mountain(x,base,peak,w,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-w,base);ctx.lineTo(x,peak);ctx.lineTo(x+w,base);ctx.closePath();ctx.fill()}
    function loop(){
      s.t++;
      const prog=Math.min(s.score/100,1), hue=(s.t*.04+s.score*1.5)%360;
      const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,`hsl(${215+prog*80},75%,${68-prog*8}%)`);g.addColorStop(1,`hsl(${275+prog*40},70%,${78-prog*8}%)`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      // clouds
      ctx.globalAlpha=.28;for(let i=0;i<7;i++){let x=((i*190-s.world*.22)%(W+220)+W+220)%(W+220)-110,y=80+(i%3)*80;ctx.fillStyle=`hsl(${(hue+i*25)%360},100%,90%)`;ctx.beginPath();ctx.arc(x,y,28,0,7);ctx.arc(x+30,y-8,38,0,7);ctx.arc(x+68,y,24,0,7);ctx.fill()}ctx.globalAlpha=1;
      for(let layer=0;layer<3;layer++){ctx.fillStyle=`hsla(${250+layer*35},55%,${42+layer*10}%,${.20+layer*.12})`;let sp=.12+layer*.13;ctx.beginPath();ctx.moveTo(0,H);for(let x=-80;x<W+100;x+=100){let xx=x-((s.world*sp)%100),pk=360-layer*55-(x%300)*.12;ctx.lineTo(xx,pk);ctx.lineTo(xx+100,450-layer*45)}ctx.lineTo(W,H);ctx.fill()}
      s.world+=4.2+Math.min(s.score*.025,3.5);
      if(s.run){
        s.plane.vy=clamp(s.plane.vy+.38,-9,9);s.plane.y+=s.plane.vy;s.plane.angle=clamp(s.plane.vy*.055,-.38,.65);
        s.spawn--;
        const gap=185-Math.min(s.score*1.0,75), speed=4.2+Math.min(s.score*.025,3.5);
        if(s.spawn<=0){let center=rnd(145,H-145);s.obs.push({x:W+60,center,gap,w:82,passed:false});s.spawn=Math.max(82,145-s.score*.45)}
        for(const o of s.obs)o.x-=speed;
        for(const o of s.obs){
          ctx.save();ctx.shadowBlur=10;ctx.shadowColor="rgba(90,30,180,.35)";
          const grad=ctx.createLinearGradient(o.x,0,o.x+o.w,0);grad.addColorStop(0,"#4c277d");grad.addColorStop(.5,"#a052b6");grad.addColorStop(1,"#38205d");ctx.fillStyle=grad;
          // top mountain
          ctx.beginPath();ctx.moveTo(o.x,0);ctx.lineTo(o.x+o.w/2,o.center-o.gap/2-35);ctx.lineTo(o.x+o.w,o.center-o.gap/2);ctx.lineTo(o.x+o.w,0);ctx.closePath();ctx.fill();
          // bottom
          ctx.beginPath();ctx.moveTo(o.x,H);ctx.lineTo(o.x+o.w/2,o.center+o.gap/2+35);ctx.lineTo(o.x+o.w,o.center+o.gap/2);ctx.lineTo(o.x+o.w,H);ctx.closePath();ctx.fill();ctx.restore();
          if(!o.passed&&o.x+o.w<s.plane.x){o.passed=true;s.score++;onScore(s.score)}
          const px=s.plane.x,py=s.plane.y;
          if(px+27>o.x&&px-27<o.x+o.w&&(py-10<o.center-o.gap/2||py+10>o.center+o.gap/2)) crash();
        }
        s.obs=s.obs.filter(o=>o.x>-120);
        if(s.plane.y<15||s.plane.y>H-15)crash();
      }
      // birds / particles
      for(let i=0;i<4;i++){let x=((i*310-s.world*.7)%(W+100)+W+100)%(W+100),y=145+i*65;ctx.strokeStyle="rgba(255,255,255,.65)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,7,Math.PI,0);ctx.stroke()}
      for(const q of s.parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.04;q.life-=.025;ctx.globalAlpha=Math.max(0,q.life);ctx.fillStyle="#ffe66d";ctx.beginPath();ctx.arc(q.x,q.y,3,0,7);ctx.fill()}ctx.globalAlpha=1;s.parts=s.parts.filter(q=>q.life>0);
      drawPlane(ctx,s.plane,s.t);
      ctx.font="800 24px system-ui";ctx.fillStyle="rgba(255,255,255,.95)";ctx.fillText(`SCORE: ${s.score}`,28,45);ctx.textAlign="right";ctx.fillText(`BEST: ${Math.max(s.best,s.score)}`,W-28,45);ctx.textAlign="left";
      raf=requestAnimationFrame(loop);
    }
    function crash(){if(!s.run)return;s.run=false;for(let i=0;i<30;i++)s.parts.push({x:s.plane.x,y:s.plane.y,vx:rnd(-5,5),vy:rnd(-5,5),life:1});onOver(s.score)}
    loop();
    return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);removeEventListener("keydown",key)}
  },[]);
  return <canvas ref={ref} aria-label="Trippy Plane game canvas"/>;
}

export default function App(){
  const [screen,setScreen]=useState("menu"),[score,setScore]=useState(0),[best,setBest]=useState(()=>Number(localStorage.getItem("trippyBest")||0)),[muted,setMuted]=useState(false);
  const over=(s)=>{const b=Math.max(best,s);setBest(b);localStorage.setItem("trippyBest",b);setScreen("over")};
  const scoreUp=(s)=>setScore(s);
  return <main className="app">
    <div className="game-wrap">
      <GameCanvas onOver={over} onScore={scoreUp} best={best}/>
      {screen==="menu"&&<section className="overlay">
        <div className="logo">TRIPPY <span>PLANE</span></div><p>How long can you survive?</p>
        <div className="plane-icon">✈</div>
        <button onClick={()=>setScreen("play")}>START GAME</button>
        <small>SPACE / CLICK / TAP TO FLY</small>
      </section>}
      {screen==="over"&&<section className="overlay dark"><h1>GAME OVER</h1><div className="result">Score: <b>{score}</b></div><div className="result">Best: <b>{best}</b></div>
        <button onClick={()=>{setScore(0);setScreen("play");window.dispatchEvent(new KeyboardEvent("keydown",{code:"Space"}))}}>PLAY AGAIN</button>
        <button className="secondary" onClick={()=>setScreen("menu")}>MAIN MENU</button>
        <small>PRESS R TO RESTART</small>
      </section>}
      <button className="mute" onClick={()=>setMuted(!muted)}>{muted?"🔇":"🔊"}</button>
    </div>
    <div className="tip">ONE BUTTON. ENDLESS SKY. 🌈</div>
  </main>
}