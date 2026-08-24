import React from 'react';
import { motion } from 'framer-motion';
export default function Background(){
  return <div className="bg-layer" aria-hidden="true">
    <div className="grid-floor"/>
    {Array.from({length:12}).map((_,i)=>
      <motion.span key={i} className={`float-shape s${i%3}`}
        initial={{y:'110vh',opacity:0}} animate={{y:'-15vh',opacity:[0,.18,.12,0],rotate:360}}
        transition={{duration:16+i*2,delay:i*1.1,repeat:Infinity,ease:'linear'}}/>
    )}
  </div>;
}
