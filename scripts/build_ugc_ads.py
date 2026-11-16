import os,json,subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
KEY=os.environ["ELEVENLABS_API_KEY"]; VOICE="HUCZkwri1gOtkkToCapk"
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
NAVY=(0x16,0x23,0x3B); MINT=(0x6E,0xE7,0xA8); TXT=(255,255,255)
ADS={
 "skincare":dict(segs=["This ad has no before and after. Here's why.",
   "Because nobody can prove what your skin will look like. So here's what is provable: four ingredients, no fragrance, thirty mil, nineteen pounds.",
   "If it doesn't suit you, send it back. That's the whole pitch."],
   shots=["a1","a3","a2","a3"], timer=None, price="£19 · 30ml"),
 "hair":dict(segs=["Three minutes. That's it. That's the whole trick.",
   "Most people rinse after thirty seconds, then wonder why their hair feels like straw.",
   "Rinse cold. Don't towel rough it. Sixteen pounds, two hundred mil."],
   shots=["b1","b2","b1","b2"], timer=True, price="£16 · 200ml"),
}
def tts(name,segs):
    os.makedirs(f"ugc/{name}",exist_ok=True); durs=[]
    for i,t in enumerate(segs):
        out=f"ugc/{name}/{i:02d}.mp3"
        if not os.path.exists(out):
            body={"text":t,"model_id":"eleven_multilingual_v2","previous_text":segs[i-1] if i else None,
              "next_text":segs[i+1] if i+1<len(segs) else None,
              "voice_settings":{"stability":0.5,"similarity_boost":0.8,"style":0.15,"use_speaker_boost":True}}
            c=subprocess.run(["curl","-sS","--max-time","90","-X","POST",
              f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
              "-H",f"xi-api-key: {KEY}","-H","Content-Type: application/json","-d",json.dumps(body),
              "-o",out,"-w","%{http_code}"],capture_output=True,text=True).stdout
            if c!="200": raise SystemExit(f"{name}{i} {c}")
        durs.append(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",out]).decode()))
    return durs

def wrap(d,text,font,maxw):
    out=[];cur=""
    for w in text.split():
        t=(cur+" "+w).strip()
        if d.textlength(t,font=font)>maxw and cur: out.append(cur);cur=w
        else: cur=t
    out.append(cur);return out

def cover(im,W,H):
    r=max(W/im.width,H/im.height); n=im.resize((int(im.width*r),int(im.height*r)),Image.LANCZOS)
    x=(n.width-W)//2; y=(n.height-H)//2; return n.crop((x,y,x+W,y+H))

def bleed_bg(im,W,H):
    b=cover(im,W,H).filter(ImageFilter.GaussianBlur(28))
    ov=Image.new("RGB",(W,H),(0,0,0)); return Image.blend(b,ov,0.45)

def draw_text(d,lines,font,x,y,maxw,size,fill=TXT,lh=1.16):
    for ln in lines:
        d.text((x,y),ln,font=font,fill=fill,stroke_width=6,stroke_fill=(0,0,0)); y+=int(size*lh)
    return y

for name,cfg in ADS.items():
    durs=tts(name,cfg["segs"]); gap=0.28; starts=[];t=0.45
    for du in durs: starts.append(t); t+=du+gap
    END=t+2.3; NF=int(round(END*30))
    imgs={k:Image.open(f"ugc/img/{k}.png").convert("RGB") for k in set(cfg["shots"])}
    global CACHE
    for layout in ("feed","story"):
        if os.path.exists(f"ugc/{name}-{layout}.mp4"): print("skip",name,layout,flush=True); continue
        CACHE={}
        W,H=(1080,1350) if layout=="feed" else (1080,1920)
        os.makedirs(f"ugc/frames/{name}-{layout}",exist_ok=True)
        for i in range(NF):
            tt=i/30
            seg=0
            for j,st in enumerate(starts):
                if tt>=st: seg=j
            endcard=tt>=starts[-1]+durs[-1]+0.25
            shot=cfg["shots"][min(seg,len(cfg["shots"])-1)]
            im=imgs[shot]
            keyb=(shot,layout)
            if keyb not in CACHE:
                if layout=="feed":
                    CACHE[keyb]=cover(im,int(W*1.07),int(H*1.07))
                else:
                    bg=bleed_bg(im,W,H); sq=cover(im,1080,1080); bg=bg.copy(); bg.paste(sq,(0,420))
                    CACHE[keyb]=bg
            if layout=="feed":
                big=CACHE[keyb]; mx0=(big.width-W)//2; my0=(big.height-H)//2
                dx=int(mx0*(1-0.5*min(1,tt/END))); dy=int(my0*(1-0.5*min(1,tt/END)))
                art=big.crop((dx,dy,dx+W,dy+H)).copy()
                tx,ty,mx=64,120,W-128
            else:
                art=CACHE[keyb].copy(); tx,ty,mx=64,150,W-128
            d=ImageDraw.Draw(art)
            fs=62 if layout=="feed" else 58
            f=ImageFont.truetype(FB,fs)
            fsm=ImageFont.truetype(FB,34)
            d.text((W-64-d.textlength("example creative",font=fsm),70),"example creative",font=fsm,fill=(230,230,230),stroke_width=4,stroke_fill=(0,0,0))
            if not endcard:
                words=cfg["segs"][seg]
                lines=wrap(d,words,f,mx)
                while len(lines)>3 and fs>38:
                    fs-=4; f=ImageFont.truetype(FB,fs); lines=wrap(d,words,f,mx)
                draw_text(d,lines,f,tx,ty,mx,fs)
                if cfg["timer"] and seg>=0:
                    # 3:00 countdown, 3 minutes compressed to the segment length
                    rem=max(0.0,180-(tt-starts[0])/max(0.1,(starts[-1]+durs[-1]-starts[0]))*180)
                    lab=f"{int(rem//60)}:{int(rem%60):02d}"
                    ft=ImageFont.truetype(FB,64)
                    bx,by=W-64-190,ty+ (fs*1.3*len(lines)) + 26
                    d.rounded_rectangle((bx,by,bx+190,by+96),radius=18,fill=(0,0,0))
                    d.text((bx+28,by+12),lab,font=ft,fill=MINT)
            else:
                a=min(1.0,(tt-(starts[-1]+durs[-1]+0.25))/0.35)
                fh=ImageFont.truetype(FB,72); fp=ImageFont.truetype(FR,40); fb=ImageFont.truetype(FB,30)
                card=(0,0,0)
                d.rectangle((0,0,W,H),fill=(int(NAVY[0]*a),int(NAVY[1]*a),int(NAVY[2]*a)))
                d.text((64,int(H*0.30)),"Made by",font=fb,fill=MINT)
                d.text((64,int(H*0.30)+44),"The AI Pound",font=fh,fill=TXT)
                d.text((64,int(H*0.30)+140),"Three ads like this, scripted,",font=fp,fill=TXT)
                d.text((64,int(H*0.30)+192),"voiced and captioned. £129.",font=fp,fill=MINT)
                d.text((64,int(H*0.30)+268),f"{cfg['price']}   ·   theaipound.co.uk",font=fb,fill=(200,210,225))
            d.text((64,H-64),"@theaipound",font=ImageFont.truetype(FR,26),fill=(235,240,248))
            art.save(f"ugc/frames/{name}-{layout}/f{i:04d}.png")
        ins=" ".join(f"-i ugc/{name}/{j:02d}.mp3" for j in range(len(durs)))
        fl="".join(f"[{j}]adelay={int(starts[j]*1000)}|{int(starts[j]*1000)}[a{j}];" for j in range(len(durs)))
        mix="".join(f"[a{j}]" for j in range(len(durs)))
        subprocess.run(f"ffmpeg -loglevel error -y {ins} -filter_complex \"{fl}{mix}amix=inputs={len(durs)}:normalize=0[vo]\" -map [vo] -t {END} -ar 44100 ugc/{name}/voice.wav",shell=True,check=True)
        subprocess.run(f"ffmpeg -loglevel error -y -stream_loop -1 -i msclone/public/pound/audio/music.mp3 -t {END} -af \"volume=0.06,afade=t=in:d=1,afade=t=out:st={max(0,END-2)}:d=2\" ugc/{name}/music.wav",shell=True,check=True)
        subprocess.run(f"ffmpeg -loglevel error -y -i ugc/{name}/voice.wav -i ugc/{name}/music.wav -filter_complex \"[0][1]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]\" -map [a] ugc/{name}/mix.wav",shell=True,check=True)
        out=f"ugc/{name}-{layout}.mp4"
        subprocess.run(f"ffmpeg -loglevel error -y -framerate 30 -i ugc/frames/{name}-{layout}/f%04d.png -i ugc/{name}/mix.wav -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -b:a 160k -shortest {out}",shell=True,check=True)
        print(name,layout,round(END,2),"s",flush=True)
