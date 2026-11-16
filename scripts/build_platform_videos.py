import os,json,subprocess,math
from PIL import Image, ImageDraw, ImageFont
KEY=os.environ["ELEVENLABS_API_KEY"]; VOICE="HUCZkwri1gOtkkToCapk"
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
NAVY=(0x16,0x23,0x3B); CARD=(0x1E,0x2D,0x49); CARD2=(0x25,0x38,0x59)
MINT=(0x6E,0xE7,0xA8); TXT=(0xF4,0xF7,0xFB); MUT=(0xA9,0xB8,0xCE); EDGE=(0x3D,0x55,0x7C)
NODES=[("WhatsApp","patient asks a question"),("AI agent","reads it, never guesses"),
 ("Price list","Google Sheet, code does the maths"),("Safety gates","infection, pregnancy, under-18"),
 ("Approval card","their team approves every reply"),("Reply sent","logged back to the sheet")]

P={
 "tiktok":dict(w=1080,h=1920,music=0.15,hook="I built a clinic an AI receptionist in one evening",
   hook_size=64,reveal=0.42,capt_size=40,
   segs=["I built a clinic an AI receptionist in one evening. Here's the whole thing.",
         "It answers, prices from a sheet, and stops dead on anything clinical. Every reply waits for a human.",
         "Would you let this answer your phone? Tell me why not."],
   cta=("Would you let this answer your phone?","comment yes or no"),cta_style="question"),
 "shorts":dict(w=1080,h=1920,music=0.10,hook="AI receptionist for clinics",
   hook_size=62,reveal=0.75,capt_size=36,
   segs=["AI receptionist for clinics. Built in n8n. Here's how it actually works.",
         "The trigger takes the question and the agent reads it. The price comes from a sheet, computed in code, so the model never touches the number.",
         "Safety gates stop it on infection, pregnancy, Roaccutane and under-18s. Then an approval card. Nothing reaches a patient until their team clears it.",
         "Two weeks free for clinics. Go to The A I Pound, dot co dot uk, slash pilot."],
   cta=("Two weeks free","theaipound.co.uk/pilot"),cta_style="offer"),
 "facebook":dict(w=1080,h=1350,music=0.08,hook="Your clinic phone, answered properly",
   hook_size=60,reveal=0.70,capt_size=38,
   segs=["If you run a clinic, the phone is the whole business. Miss the call and they book somewhere else.",
         "This answers it, gives the treatment price, and every reply is checked by your team before it goes out.",
         "Two weeks free. No card, no contract, no lock in."],
   cta=("Two weeks free","theaipound.co.uk/pilot"),cta_style="offer"),
 "linkedin":dict(w=1080,h=1080,music=0.07,hook="The part of an AI receptionist nobody films",
   hook_size=54,reveal=0.80,capt_size=32,
   segs=["Everyone films the happy path. Here's the part that decides whether an AI receptionist survives contact with a real clinic.",
         "Prices come from a sheet and are computed in code, so the model never touches a number. Anything clinical stops at a gate. Every reply sits in an approval card until a human clears it.",
         "Two weeks free for clinics. Building in public."],
   cta=("Two weeks free","theaipound.co.uk/pilot"),cta_style="offer"),
}

def tts(name,segs):
    os.makedirs(f"pv/{name}",exist_ok=True); durs=[]
    for i,t in enumerate(segs):
        out=f"pv/{name}/{i:02d}.mp3"
        if not os.path.exists(out):
            body={"text":t,"model_id":"eleven_multilingual_v2","previous_text":segs[i-1] if i else None,
              "next_text":segs[i+1] if i+1<len(segs) else None,
              "voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True}}
            code=subprocess.run(["curl","-sS","--max-time","90","-X","POST",
              f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
              "-H",f"xi-api-key: {KEY}","-H","Content-Type: application/json","-d",json.dumps(body),
              "-o",out,"-w","%{http_code}"],capture_output=True,text=True).stdout
            if code!="200": raise SystemExit(f"{name} {i} {code} {open(out,errors='ignore').read()[:150]}")
        durs.append(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out]).decode()))
    return durs

def wrap(d,text,font,maxw):
    out=[];cur=""
    for w in text.split():
        t=(cur+" "+w).strip()
        if d.textlength(t,font=font)>maxw and cur: out.append(cur); cur=w
        else: cur=t
    out.append(cur); return out

ONLY=os.environ.get("ONLY","")
for name,cfg in P.items():
    if ONLY and name!=ONLY: continue
    durs=tts(name,cfg["segs"])
    gap=0.32; starts=[];t=0.55
    for du in durs: starts.append(t); t+=du+gap
    END=t+1.6; W,H=cfg["w"],cfg["h"]; FPS=30; NF=int(round(END*FPS))
    m=64; f_brand=ImageFont.truetype(FB,24); f_hook=ImageFont.truetype(FB,cfg["hook_size"])
    f_cap=ImageFont.truetype(FB,cfg["capt_size"]); f_nt=ImageFont.truetype(FB,28)
    f_ns=ImageFont.truetype(FR,20); f_cta=ImageFont.truetype(FB,int(cfg["hook_size"]*0.95))
    f_ctas=ImageFont.truetype(FR,30); f_foot=ImageFont.truetype(FR,24)
    # header height depends on wrapped hook
    tmp=Image.new("RGB",(W,H)); dd=ImageDraw.Draw(tmp)
    hook_lines=wrap(dd,cfg["hook"],f_hook,W-2*m)
    head=90+34+len(hook_lines)*(cfg["hook_size"]+12)+16
    canvas_top=head+20; canvas_bot=int(H*(0.70 if H>1600 else 0.66))
    cols,rows=2,3
    gw=(W-2*m-28)//2; gh=min(112,(canvas_bot-canvas_top-2*26)//3)
    pos=[]
    for r in range(rows):
        for c in range(cols):
            pos.append((m+c*(gw+28), canvas_top+r*(gh+26)))
    show=[0.55+i*cfg["reveal"] for i in range(6)]
    os.makedirs(f"pvframes/{name}",exist_ok=True)
    for i in range(NF):
        tt=i/FPS; img=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(img)
        for gx in range(0,W,44):
            for gy in range(canvas_top,canvas_bot,44):
                d.ellipse((gx+2,gy+2,gx+4,gy+4),fill=(0x24,0x33,0x50))
        d.text((m,56),"THE AI POUND",font=f_brand,fill=MINT)
        y=92
        for ln in hook_lines:
            d.text((m,y),ln,font=f_hook,fill=TXT); y+=cfg["hook_size"]+12
        d.line((m,head,W-m,head),fill=(0x2C,0x3D,0x5C),width=2)
        # edges
        for k in range(5):
            x1,y1=pos[k][0]+gw,pos[k][1]+gh//2; x2,y2=pos[k+1][0],pos[k+1][1]+gh//2
            t0=show[k+1]
            if tt<t0-0.35: continue
            p=min(1.0,max(0.0,(tt-(t0-0.35))/0.35))
            if pos[k][1]==pos[k+1][1]:
                mx=(x1+x2)/2; pts=[(x1,y1),(mx,y1),(mx,y2),(x2,y2)]
            else:
                pts=[(x1,y1),((x1+x2)/2,y1),((x1+x2)/2,y2),(x2,y2)]
            total=sum(abs(b[0]-a[0])+abs(b[1]-a[1]) for a,b in zip(pts,pts[1:])); rem=total*p; prev=pts[0]
            for np_ in pts[1:]:
                if rem<=0: break
                dx=np_[0]-prev[0]; dy=np_[1]-prev[1]; L=abs(dx)+abs(dy)
                f=1.0 if L<=rem else rem/L; end=(prev[0]+dx*f,prev[1]+dy*f)
                d.line((prev,end),fill=MINT,width=4); rem-=min(L,rem); prev=end
        for k,(title,sub) in enumerate(NODES):
            if tt<show[k]: continue
            x,y=pos[k]; glow = tt>starts[1]-0.2 and k==4
            d.rounded_rectangle((x,y,x+gw,y+gh),radius=16,fill=CARD2 if glow else CARD,
                outline=MINT if glow else EDGE,width=3 if glow else 2)
            d.ellipse((x+16,y+gh//2-15,x+46,y+gh//2+15),fill=MINT if not glow else TXT)
            d.text((x+58,y+16),title,font=f_nt,fill=TXT)
            d.text((x+58,y+52),sub,font=f_ns,fill=MUT)
        for k,s in enumerate(show):
            if s<=tt<s+0.35:
                cx,cy=pos[k][0]+gw-26,pos[k][1]+gh-8
                d.polygon([(cx,cy),(cx+24,cy+28),(cx+10,cy+29),(cx+17,cy+43)],fill=TXT); break
        # captions
        seg=None
        for j,st in enumerate(starts):
            if tt>=st and (j+1==len(starts) or tt<starts[j+1]): seg=j
        endcard = tt>=starts[-1]+durs[-1]+0.15
        if seg is not None and not endcard:
            fs=cfg["capt_size"]; lines=wrap(d,cfg["segs"][seg],ImageFont.truetype(FB,fs),W-2*m)
            while len(lines)>3 and fs>24:
                fs-=2; lines=wrap(d,cfg["segs"][seg],ImageFont.truetype(FB,fs),W-2*m)
            f_cap=ImageFont.truetype(FB,fs)
            base=canvas_bot+40
            for ln in lines:
                d.text((m,base),ln,font=f_cap,fill=TXT); base+=cfg["capt_size"]+10
        # end card
        if endcard:
            a=min(1.0,(tt-(starts[-1]+durs[-1]+0.15))/0.35)
            ch=int(120*a)
            d.rounded_rectangle((m,H-200-ch,W-m,H-90),radius=18,fill=CARD2,outline=MINT,width=3)
            d.text((m+36,H-200-ch+26),cfg["cta"][0],font=f_cta,fill=MINT)
            d.text((m+36,H-200-ch+26+int(cfg["hook_size"]*1.15)),cfg["cta"][1],font=f_ctas,fill=TXT)
        d.text((m,H-56),"@theaipound",font=f_foot,fill=MUT)
        img.save(f"pvframes/{name}/f{i:04d}.png")
    # audio
    ins=" ".join(f"-i pv/{name}/{j:02d}.mp3" for j in range(len(durs)))
    fl="".join(f"[{j}]adelay={int(starts[j]*1000)}|{int(starts[j]*1000)}[a{j}];" for j in range(len(durs)))
    mix="".join(f"[a{j}]" for j in range(len(durs)))
    subprocess.run(f"ffmpeg -loglevel error -y {ins} -filter_complex \"{fl}{mix}amix=inputs={len(durs)}:normalize=0[vo]\" -map [vo] -t {END} -ar 44100 pv/{name}/voice.wav",shell=True,check=True)
    subprocess.run(f"ffmpeg -loglevel error -y -stream_loop -1 -i msclone/public/pound/audio/music.mp3 -t {END} -af \"volume={cfg['music']},afade=t=in:d=1.2,afade=t=out:st={max(0,END-2.4)}:d=2.4\" pv/{name}/music.wav",shell=True,check=True)
    subprocess.run(f"ffmpeg -loglevel error -y -i pv/{name}/voice.wav -i pv/{name}/music.wav -filter_complex \"[0][1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]\" -map [a] pv/{name}/mix.wav",shell=True,check=True)
    out=f"pv-video/{name}.mp4"; os.makedirs("pv-video",exist_ok=True)
    subprocess.run(f"ffmpeg -loglevel error -y -framerate 30 -i pvframes/{name}/f%04d.png -i pv/{name}/mix.wav -c:v libx264 -pix_fmt yuv420p -crf 19 -c:a aac -b:a 192k -shortest {out}",shell=True,check=True)
    print(name,"->",out,round(END,2),"s",NF,"frames",flush=True)
