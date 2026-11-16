import os, math, subprocess, json
from PIL import Image, ImageDraw, ImageFont

W,H=1080,1920; FPS=30
NAVY=(0x16,0x23,0x3B); CARD=(0x1E,0x2D,0x49); CARD2=(0x24,0x36,0x57)
MINT=(0x6E,0xE7,0xA8); TXT=(0xF4,0xF7,0xFB); MUT=(0xA9,0xB8,0xCE); EDGE=(0x3D,0x55,0x7C)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
f_brand=ImageFont.truetype(FB,26); f_h=ImageFont.truetype(FB,58); f_sub=ImageFont.truetype(FR,30)
f_nt=ImageFont.truetype(FB,30); f_ns=ImageFont.truetype(FR,21); f_cap=ImageFont.truetype(FB,38)
f_cta=ImageFont.truetype(FB,64); f_ctas=ImageFont.truetype(FR,34); f_foot=ImageFont.truetype(FR,26)

VO=[9.221,4.833,2.116]
START0=0.6; GAP=0.35
S1=START0+VO[0]+GAP; S2=S1+VO[1]+GAP
END=S2+VO[2]+2.0
NF=int(round(END*FPS))

nodes=[
 ("1","WhatsApp","patient asks a question",(70,392)),
 ("2","AI agent","reads it, never guesses",(420,512)),
 ("3","Price list","Google Sheet, code does the maths",(90,652)),
 ("4","Safety gates","infection, pregnancy, under-18",(430,772)),
 ("5","Approval card","their team approves every reply",(110,912)),
 ("6","Reply sent","logged back to the sheet",(450,1032)),
]
NW,NH=340,112
SHOW=[0.7,1.6,2.8,3.9,5.0,6.1]
CURSOR=[(70+300,392+56),(420+300,512+56),(90+300,652+56),(430+300,772+56),(110+300,912+56),(450+300,1032+56)]

def rr(d,box,r,fill,outline=None,w=2):
    d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=w)

def draw_grid(d,shift):
    for gx in range(0,W,48):
        for gy in range(280,H-560,48):
            y=gy+int(shift)%48
            d.ellipse((gx+2,y+2,gx+4,y+4),fill=(0x24,0x33,0x50))

def caption(d,text,t_wrap):
    words=text.split(); lines=[]; cur=""
    for wd in words:
        t=(cur+" "+wd).strip()
        if d.textlength(t,font=f_cap)>W-190: lines.append(cur); cur=wd
        else: cur=t
    lines.append(cur)
    y=1400-(len(lines)-1)*26
    for ln in lines:
        tw=d.textlength(ln,font=f_cap)
        d.text(((W-tw)/2,y),ln,font=f_cap,fill=TXT); y+=56

for i in range(NF):
    t=i/FPS
    img=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(img)
    # top brand
    d.text((70,88),"THE AI POUND",font=f_brand,fill=MINT)
    d.text((70,132),"AI receptionist for a clinic",font=f_h,fill=TXT)
    d.text((70,208),"built in n8n  ·  approval-gated",font=f_sub,fill=MUT)
    d.line((70,268,W-70,268),fill=(0x2C,0x3D,0x5C),width=2)
    draw_grid(d,t*22)

    # edges
    for k in range(5):
        t0=SHOW[k+1]
        if t<t0-0.45: continue
        p=min(1.0,max(0.0,(t-(t0-0.45))/0.45))
        x1,y1=nodes[k][3][0]+NW,nodes[k][3][1]+NH//2
        x2,y2=nodes[k+1][3][0],nodes[k+1][3][1]+NH//2
        mx=(x1+x2)/2
        pts=[(x1,y1),(mx,y1),(mx,y2),(x2,y2)]
        # partial
        segs=[]; total=abs(mx-x1)+abs(y2-y1)+abs(x2-mx)
        rem=total*p; prev=pts[0]
        for np_ in pts[1:]:
            if rem<=0: break
            dx=np_[0]-prev[0]; dy=np_[1]-prev[1]; L=abs(dx)+abs(dy)
            f=1.0 if L<=rem else rem/L
            endp=(prev[0]+dx*f, prev[1]+dy*f)
            segs.append((prev,endp)); rem-=min(L,rem); prev=endp
        for a,b in segs: d.line((a,b),fill=MINT,width=4)

    # nodes
    for k,(num,title,sub,(x,y)) in enumerate(nodes):
        if t<SHOW[k]: continue
        a=min(1.0,(t-SHOW[k])/0.30)
        glow = t>S1-0.2 and k==4
        col=CARD2 if glow else CARD
        rr(d,(x,y,x+NW,y+NH),18,col,MINT if glow else EDGE,3 if glow else 2)
        d.ellipse((x+18,y+NH//2-16,x+50,y+NH//2+16),fill=MINT if not glow else TXT)
        d.text((x+26,y+NH//2-14),"",font=f_ns,fill=NAVY)
        d.text((x+64,y+18),title,font=f_nt,fill=TXT)
        d.text((x+64,y+58),sub,font=f_ns,fill=MUT)
        # little port dots
        d.ellipse((x-6,y+NH//2-6,x+6,y+NH//2+6),fill=EDGE)

    # cursor on the node currently being added
    for k,s in enumerate(SHOW):
        if s<=t<s+0.45:
            cx,cy=CURSOR[k]
            d.polygon([(cx,cy),(cx+26,cy+30),(cx+11,cy+31),(cx+18,cy+46)],fill=TXT)
            break
    if t>=S1-0.2 and t<S1+3.2:
        cx,cy=nodes[4][3][0]+NW-10,nodes[4][3][1]+NH+6
        d.polygon([(cx,cy),(cx+26,cy+30),(cx+11,cy+31),(cx+18,cy+46)],fill=TXT)

    # captions
    if START0<=t<S1: caption(d,"This is an AI receptionist for a clinic. Built in n8n. It answers, prices from a spreadsheet, and stops dead on anything clinical.",0)
    elif S1<=t<S2: caption(d,"Every reply waits for a person to approve it. That is the whole difference.",0)
    elif t>=S2: caption(d,"Two weeks free. Link in bio.",0)

    # end card
    if t>=S2:
        a=min(1.0,(t-S2)/0.4)
        rr(d,(70,1600,W-70,1760),20,CARD2,MINT,3)
        d.text((110,1628),"Two weeks free",font=f_cta,fill=MINT)
        d.text((110,1702),"theaipound.co.uk/pilot",font=f_ctas,fill=TXT)

    d.text((70,H-56),"@theaipound",font=f_foot,fill=MUT)
    img.save(f"canvasframes/f{i:04d}.png")

print("frames",NF,"end",END)
