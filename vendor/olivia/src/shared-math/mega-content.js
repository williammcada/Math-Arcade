// Original Grades 3–7 textual practice. Standards identify practiced components;
// visual models, explanations, geometry and statistics are outside this bank.
const Skills = (() => {
 const list=[], r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)), pick=a=>a[r(0,a.length-1)];
 const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a), frac=(n,d)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);return n/g+'/'+d/g};
 const q=(prompt,answer,type='number')=>({prompt,answer,type});
 const add=(grade,id,name,standard,make,prereq)=>list.push({grade,id,name,standard,make,prereq});
 const f=(p,n,d)=>q(p+' Give a reduced fraction or whole number.',frac(n,d),'fraction');
 const cmp=(a,b)=>a<b?'<':a>b?'>':'=';
 const den=()=>pick([2,3,4,5,6,8,10,12]);
 const clock=n=>{n=((n%1440)+1440)%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
 const time=n=>clock(n)+(n>=1440?' next day':n<0?' previous day':'');
 const decimal=(n,d=100)=>String(Number((n/d).toFixed(6)));
 const calc=(p,a)=>q(p+' = ?',a);
 const comparison=(a,b)=>q('Compare: '+a+' ___ '+b+'. Enter <, > or =.',cmp(value(a),value(b)),'comparison');

 const ampm=n=>{n=((n%1440)+1440)%1440;const h=Math.floor(n/60);return (h%12||12)+':'+String(n%60).padStart(2,'0')+' '+(h<12?'AM':'PM')};
 const g3den=()=>pick([2,3,4,6,8]);
 const g3divisionQuotient=()=>Math.random()<0.05?1:r(2,9);
 // Grade 3 textual components; no diagram, area, volume or graph tasks.
 add(3,'g3-mul','Multiplication facts within 100','3.OA.A.1, C.7',()=>{let a=r(0,9),b=r(0,9);return calc(a+' × '+b,a*b)});
 add(3,'g3-div','Division facts within 100','3.OA.A.2, C.7',()=>{let divisor=r(2,9),quotient=g3divisionQuotient();return calc(divisor*quotient+' ÷ '+divisor,quotient)},'g3-mul');
 add(3,'g3-groups','Equal groups: multiplication stories','3.OA.A.3',()=>{let a=r(2,9),b=r(2,9);return q(a+' bags have '+b+' marbles each. How many marbles altogether?',a*b)},'g3-mul');
 add(3,'g3-sharing','Equal sharing: division stories','3.OA.A.3',()=>{let a=r(2,9),b=r(2,9);return q(a*b+' stickers are shared equally among '+a+' children. How many stickers per child?',b)},'g3-div');
 add(3,'g3-groupcount','How many groups?','3.OA.A.3',()=>{let a=r(2,9),b=r(2,9);return q(a*b+' pencils are packed '+a+' per box. How many boxes?',b)},'g3-div');
 add(3,'g3-factor','Missing multiplication factors','3.OA.A.4, B.6',()=>{let a=r(1,9),b=r(0,9);return q(a+' × x = '+a*b+'. Find x.',b)},'g3-div');
 add(3,'g3-dividend','Missing dividend','3.OA.A.4',()=>{let divisor=r(2,9),quotient=g3divisionQuotient();return q('x ÷ '+divisor+' = '+quotient+'. Find x.',divisor*quotient)},'g3-mul');
 add(3,'g3-divisor','Missing divisor','3.OA.A.4',()=>{let quotient=g3divisionQuotient(),divisor=r(2,9);return q(divisor*quotient+' ÷ x = '+quotient+'. Find x.',divisor)},'g3-div');
 add(3,'g3-commute','Multiplication in either order','3.OA.B.5',()=>{let a=r(1,9),b=r(1,9);return q(a+' × '+b+' = '+b+' × x. Find x.',a)},'g3-mul');
 add(3,'g3-distribute','Break apart multiplication','3.OA.B.5',()=>{let a=r(2,9),b=r(2,5),c=r(1,4);return q(a+' × '+(b+c)+' = '+a+' × '+b+' + '+a+' × x. Find x.',c)},'g3-mul');
 add(3,'g3-associate','Group three factors','3.OA.B.5',()=>{let a=r(1,4),b=r(1,4),c=r(1,5);return calc('('+a+' × '+b+') × '+c,a*b*c)},'g3-mul');
 add(3,'g3-two-step','Two-step whole-number stories','3.OA.D.8',()=>{let a=r(2,9),b=r(2,9),c=r(1,a*b);return q('You buy '+a+' packs of '+b+' cards. You give away '+c+' cards. How many remain?',a*b-c)},'g3-groups');
 add(3,'g3-two-step-div','Two-step sharing stories','3.OA.D.8',()=>{let groups=r(2,9),each=r(2,9),extra=r(1,20);return q('You have '+(groups*each+extra)+' stickers. Keep '+extra+' and share the rest among '+groups+' friends. How many does each friend get?',each)},'g3-sharing');
 add(3,'g3-order','Operation order: no parentheses or exponents','3.OA.D.8',()=>{let a=r(1,20),b=r(2,9),c=r(2,9);return r(0,1)?calc(a+' + '+b+' × '+c,a+b*c):calc(b*c+' ÷ '+b+' + '+a,c+a)},'g3-mul');
 add(3,'g3-pattern','Arithmetic patterns','3.OA.D.9',()=>{let start=r(1,20),step=r(2,9);return q('Each number increases by '+step+': '+[start,start+step,start+2*step].join(', ')+', ___. What comes next?',start+3*step)});
 add(3,'g3-round10','Round to the nearest ten','3.NBT.A.1',()=>{let n=r(1,999);return q('Round '+n+' to the nearest ten. If halfway, round up.',Math.round(n/10)*10)});
 add(3,'g3-round100','Round to the nearest hundred','3.NBT.A.1',()=>{let n=r(100,999);return q('Round '+n+' to the nearest hundred. If halfway, round up.',Math.round(n/100)*100)},'g3-round10');
 add(3,'g3-add','Addition within 1000','3.NBT.A.2',()=>{let a=r(10,800),b=r(10,1000-a);return calc(a+' + '+b,a+b)});
 add(3,'g3-sub','Subtraction within 1000','3.NBT.A.2',()=>{let a=r(20,1000),b=r(10,a);return calc(a+' − '+b,a-b)},'g3-add');
 add(3,'g3-addmissing','Missing addends','3.NBT.A.2 practice',()=>{let a=r(10,500),b=r(10,400);return q('x + '+a+' = '+(a+b)+'. Find x.',b)},'g3-sub');
 add(3,'g3-submissing','Missing subtraction values','3.NBT.A.2 practice',()=>{let a=r(20,500),b=r(10,400),first=r(0,1);return q(first?'x − '+a+' = '+b+'. Find x.':(a+b)+' − x = '+a+'. Find x.',first?a+b:b)},'g3-sub');
 add(3,'g3-tensmul','Multiply by multiples of ten','3.NBT.A.3',()=>{let a=r(1,9),b=r(1,9)*10;return calc(a+' × '+b,a*b)},'g3-mul');
 add(3,'g3-unitfraction','One equal part as a fraction','3.NF.A.1 textual component',()=>{let d=g3den();return f('One whole is split into '+d+' equal parts. What fraction is one part?',1,d)});
 add(3,'g3-fraction','Several equal parts as a fraction','3.NF.A.1 textual component',()=>{let d=g3den(),n=r(1,d);return f('One whole is split into '+d+' equal parts. What fraction is '+n+' of those parts?',n,d)},'g3-unitfraction');
 add(3,'g3-equivalent','Simple equivalent fractions','3.NF.A.3',()=>{let [n,d,k]=pick([[1,2,2],[1,2,3],[1,2,4],[1,3,2],[2,3,2],[1,4,2],[3,4,2]]);return q(n+'/'+d+' = x/'+d*k+'. Find x.',n*k)},'g3-fraction');
 add(3,'g3-reduce','Reduce simple fractions','3.NF.A.3 textual component',()=>{let [n,d]=pick([[2,4],[3,6],[4,8],[2,6],[4,6],[2,8],[6,8]]);return f('Reduce '+n+'/'+d+'.',n,d)},'g3-equivalent');
 add(3,'g3-wholefraction','Fractions equal to whole numbers','3.NF.A.3c',()=>{let d=g3den(),n=r(1,4);return q('What whole number equals '+n*d+'/'+d+'?',n)},'g3-fraction');
 add(3,'g3-compareden','Compare fractions: same denominator','3.NF.A.3d',()=>{let d=g3den();return comparison(r(1,d)+'/'+d,r(1,d)+'/'+d)},'g3-fraction');
 add(3,'g3-comparenum','Compare fractions: same numerator','3.NF.A.3d',()=>{let d=g3den(),e=g3den(),n=r(1,Math.min(d,e));return comparison(n+'/'+d,n+'/'+e)},'g3-compareden');
 add(3,'g3-elapsed','Elapsed minutes: AM/PM','3.MD.A.1 textual component',()=>{let start=r(420,1020),d=r(5,60);return q('Start at '+ampm(start)+'. Finish at '+ampm(start+d)+' the same day. How many minutes pass?',d)});
 add(3,'g3-timeend','Find an ending time: AM/PM','3.MD.A.1 textual component',()=>{let start=r(420,1020),d=r(5,60);return q('Start at '+ampm(start)+' and work for '+d+' minutes. What time do you finish? Enter h:mm AM or PM.',ampm(start+d),'time12')},'g3-elapsed');
 add(3,'g3-timestart','Find a starting time: AM/PM','3.MD.A.1 textual component',()=>{let start=r(420,1020),d=r(5,60);return q('A '+d+'-minute activity ends at '+ampm(start+d)+'. When did it start? Enter h:mm AM or PM.',ampm(start),'time12')},'g3-timeend');
 add(3,'g3-time-addsubtract','Basic elapsed time: hours and 5-minute steps','3.MD.A.1 textual component',()=>{let start=r(420,1080),hours=r(1,3),minutes=5*r(1,11),duration=hours*60+minutes,end=start+duration,forward=r(0,1);return forward?q('An activity starts at '+ampm(start)+' and lasts '+hours+' hour'+(hours===1?'':'s')+' and '+minutes+' minutes. What time does it end? Enter h:mm AM or PM.',ampm(end),'time12'):q('An activity ends at '+ampm(end)+' and lasts '+hours+' hour'+(hours===1?'':'s')+' and '+minutes+' minutes. What time did it start? Enter h:mm AM or PM.',ampm(start),'time12')},'g3-timestart');
 add(3,'g3-mass','Mass word problems in the same units','3.MD.A.2 textual component',()=>{let a=r(2,9),b=r(2,9);return q(a+' bags each weigh '+b+' kg. What is their total mass in kilograms?',a*b)},'g3-groups');
 // Grade 4: operations and algebraic thinking, base ten, fractions, measurement/time.
 add(4,'g4-mulcompare','Multiplicative comparisons','4.OA.A.1–2',()=>{let a=r(3,12),b=r(2,9);return q('Mia has '+a+' cards. Leo has '+b+' times as many. How many cards does Leo have?',a*b)},'g4-mul');
 add(4,'g4-word','Equal-groups word problems','4.OA.A.2–3',()=>{let a=r(3,12),b=r(4,15);return q(a+' boxes hold '+b+' pencils each. How many pencils altogether?',a*b)},'g4-mul');
 add(4,'g4-multistep','Multistep whole-number word problems','4.OA.A.3',()=>{let a=r(3,9),b=r(10,30),c=r(1,b),d=r(2,6);return q('A club buys '+a+' packs of '+b+' tickets, then gives away '+c+' tickets. It later buys '+d+' more tickets. How many now?',a*b-c+d)},'g4-word');
 add(4,'g4-remainderword','Remainders in word problems','4.OA.A.3',()=>{let b=r(3,9),n=r(5,30)*b+r(1,b-1);return q(n+' children need vans. Each van holds '+b+' children. What is the fewest vans needed?',Math.ceil(n/b))},'g4-div');
 add(4,'g4-factors','Missing factors','4.OA.B.4',()=>{let a=r(2,10),b=r(2,10);return q(a+' × x = '+a*b+'. Find x.',b)},'g4-mul');
 add(4,'g4-prime','Prime and composite numbers','4.OA.B.4',()=>{let n=r(2,100);return q('How many positive factors does '+n+' have? A prime has exactly two.',Array.from({length:n},(_,i)=>i+1).filter(d=>n%d===0).length)});
 add(4,'g4-multiples','Multiples','4.OA.B.4',()=>{let n=r(2,12),k=r(3,8);return q('What is the '+k+'th positive multiple of '+n+'?',n*k)},'g4-mul');
 add(4,'g4-pattern','Number patterns','4.OA.C.5',()=>{let a=r(1,20),b=r(2,9);return q('Start at '+a+'. Add '+b+' each time. What is the fifth term (count '+a+' as term 1)?',a+4*b)});
 add(4,'g4-place','Whole-number place value','4.NBT.A.1–2',()=>{let n=r(100000,999999),p=pick([10,100,1000,10000,100000]);return q('In '+n+', what is the value of the digit in the '+({10:'tens',100:'hundreds',1000:'thousands',10000:'ten-thousands',100000:'hundred-thousands'}[p])+' place?',Math.floor(n/p)%10*p)});
 add(4,'g4-expand','Expanded form to a number','4.NBT.A.2',()=>{let a=r(1,9),b=r(1,9),c=r(1,9);return calc(a*10000+' + '+b*100+' + '+c,a*10000+b*100+c)});
 add(4,'g4-compare','Whole-number comparison','4.NBT.A.2',()=>comparison(r(10000,999999),r(10000,999999)));
 add(4,'g4-round','Whole-number rounding','4.NBT.A.3',()=>{let n=r(1000,999999),p=pick([10,100,1000]);return q('Round '+n+' to the nearest '+p+'. If halfway, round up.',Math.round(n/p)*p)});
 add(4,'g4-add','Whole-number addition','4.NBT.B.4',()=>{let a=r(1000,499999),b=r(1000,499999);return calc(a+' + '+b,a+b)});
 add(4,'g4-sub','Whole-number subtraction','4.NBT.B.4',()=>{let a=r(1000,999999),b=r(1,a);return calc(a+' − '+b,a-b)});
 add(4,'g4-mul','Whole-number multiplication','4.NBT.B.5',()=>{let a=r(0,1)?r(100,9999):r(12,99),b=a>99?r(2,9):r(12,99);return calc(a+' × '+b,a*b)},'g4-add');
 add(4,'g4-div','Whole-number division','4.NBT.B.6',()=>{let b=r(2,9),c=r(12,999);return calc(b*c+' ÷ '+b,c)},'g4-mul');
 add(4,'g4-remainder','Division remainders','4.NBT.B.6',()=>{let b=r(2,9),c=r(12,999),m=r(1,b-1);return q('What is the remainder when '+(b*c+m)+' is divided by '+b+'?',m)},'g4-div');
 add(4,'g4-equivalent','Reduce fractions','4.NF.A.1',()=>{let d=den(),a=r(1,d-1),m=r(2,6);return f('Reduce '+a*m+'/'+d*m+'.',a,d)});
 add(4,'g4-missingfraction','Equivalent fractions: missing numerator','4.NF.A.1',()=>{let d=den(),a=r(1,d-1),m=r(2,5);return q(a+'/'+d+' = x/'+d*m+'. Find x.',a*m)},'g4-equivalent');
 add(4,'g4-fcompare','Compare fractions','4.NF.A.2',()=>{let d=den(),e=den();return comparison(r(1,d)+'/'+d,r(1,e)+'/'+e)},'g4-equivalent');
 add(4,'g4-fraction','Add like-denominator fractions','4.NF.B.3',()=>{let d=den(),a=r(1,d),b=r(1,d);return f(a+'/'+d+' + '+b+'/'+d,a+b,d)});
 add(4,'g4-fsub','Subtract like-denominator fractions','4.NF.B.3',()=>{let d=den(),a=r(2,d*2),b=r(1,a);return f(a+'/'+d+' − '+b+'/'+d,a-b,d)},'g4-fraction');
 add(4,'g4-mixed','Mixed-number addition and subtraction','4.NF.B.3',()=>{let d=den(),a=r(3,8),b=r(1,2),n=r(1,d-1),m=r(1,d-1),sg=pick([1,-1]);return f(a+' '+n+'/'+d+(sg===1?' + ':' − ')+b+' '+m+'/'+d,a*d+n+sg*(b*d+m),d)},'g4-fsub');
 add(4,'g4-fwhole','Fraction × whole number','4.NF.B.4',()=>{let d=den(),a=r(1,d-1),b=r(2,12);return f(b+' × '+a+'/'+d,a*b,d)},'g4-fraction');
 add(4,'g4-fword','Fraction word problems','4.NF.B.3–4',()=>{let d=den(),a=r(1,d-1),b=r(2,6);return f('Each ribbon uses '+a+'/'+d+' m. How many meters for '+b+' ribbons?',a*b,d)},'g4-fwhole');
 add(4,'g4-tenths','Add tenths and hundredths','4.NF.C.5',()=>{let a=r(1,9),b=r(1,90);return f(a+'/10 + '+b+'/100',10*a+b,100)},'g4-fraction');
 add(4,'g4-decimal','Fractions to decimals','4.NF.C.6',()=>{let d=pick([10,100]),a=r(1,d*3);return q('Write '+a+'/'+d+' as a decimal.',decimal(a,d),'decimal')});
 add(4,'g4-dectofrac','Decimals to reduced fractions','4.NF.C.6',()=>{let a=r(1,299);return f('Write '+decimal(a)+' as a reduced fraction.',a,100)},'g4-equivalent');
 add(4,'g4-deccompare','Compare decimals to hundredths','4.NF.C.7',()=>comparison(decimal(r(1,999)),decimal(r(1,999))));
 const units=[['m','cm',100],['km','m',1000],['kg','g',1000],['L','mL',1000],['hours','minutes',60],['minutes','seconds',60],['feet','inches',12],['yards','feet',3]];
 add(4,'g4-convert','Larger to smaller units','4.MD.A.1',()=>{let [a,b,k]=pick(units),n=r(2,20);return q(n+' '+a+' = how many '+b+'? (1 '+a+' = '+k+' '+b+'.)',n*k)},'g4-mul');
 add(4,'g4-measureword','Unit and money word problems','4.MD.A.2',()=>{let a=r(2,9),b=r(10,90);return q('A rope is '+a+' m long. '+b+' cm is cut off. How many centimeters remain? (1 m = 100 cm.)',100*a-b)},'g4-convert');
 add(4,'g4-elapsed','Elapsed time: duration','4.MD.A.2',()=>{let a=r(300,1000),d=r(15,240);return q('A trip starts at '+ampm(a)+' and ends at '+ampm(a+d)+' the same day. How many minutes does it take?',d)});
 add(4,'g4-timeforward','Elapsed time: ending time','4.MD.A.2',()=>{let a=r(300,1100),d=r(15,240);return q('Start at '+ampm(a)+'. Work for '+d+' minutes. Enter the ending time as h:mm AM or PM.',ampm(a+d),'time12')},'g4-elapsed');
 add(4,'g4-timeback','Elapsed time: starting time','4.MD.A.2',()=>{let a=r(300,1000),d=r(15,240);return q('A '+d+'-minute trip ends at '+ampm(a+d)+'. Enter its starting time as h:mm AM or PM.',ampm(a),'time12')},'g4-timeforward');
 add(4,'g4-midnight','Elapsed time across midnight','4.MD.A.2',()=>{let a=r(1260,1439),d=r(1440-a,360);return q('Start at '+ampm(a)+' Monday; finish at '+ampm(a+d)+' Tuesday. How many minutes pass?',d)},'g4-elapsed');
 add(4,'g4-notation','24-hour time: conversions and elapsed time','4.MD.A.2 extension',()=>{let a=r(0,1439),d=r(15,180),kind=r(0,3);if(kind===0)return q('Write '+ampm(a)+' in 24-hour HH:MM notation.',clock(a),'time');if(kind===1)return q('In 24-hour time, start at '+clock(a)+' and continue '+d+' minutes. Ending clock time? Enter HH:MM'+(a+d>=1440?' (next day).':'.'),clock(a+d),'time');if(kind===2)return q('A '+d+'-minute activity ends at '+clock(a+d)+' (24-hour time). Starting clock time? Enter HH:MM.',clock(a),'time');return q('Start at '+clock(a)+' and finish at '+clock(a+d)+(a+d>=1440?' the next day':' the same day')+' (24-hour times). How many minutes pass?',d)});
 add(4,'g4-timewords','Quarter-hour time language','4.MD.A.2 extension',()=>{let h=r(2,10),m=pick([15,30,45]);return q('Write '+(m===15?'quarter past '+h:m===30?'half past '+h:'quarter to '+(h+1))+' in the morning as h:mm AM or PM.',ampm(h*60+m),'time12')});
 add(4,'g4-timeunits','Hours, minutes and seconds','4.MD.A.1–2',()=>{let h=r(0,3),m=r(1,59),s=r(1,59);return q(h+' hours '+m+' minutes '+s+' seconds equals how many seconds? (1 hour = 60 minutes; 1 minute = 60 seconds.)',h*3600+m*60+s)},'g4-convert');
 add(4,'g4-timejourney','Multistep journeys and deadlines','4.MD.A.2',()=>{let a=r(400,900),b=r(15,70),c=r(5,25),d=r(15,70),back=r(0,1);return q('A journey takes '+b+' minutes, a '+c+'-minute stop, then '+d+' more minutes. '+(back?'To finish at '+ampm(a+b+c+d)+', when must it start?':'Starting at '+ampm(a)+', when does it finish?')+' Enter h:mm AM or PM.',ampm(back?a:a+b+c+d),'time12')},'g4-timeback');
 add(4,'g4-timewait','Schedules, waiting and transfers','4.MD.A.2',()=>{let a=r(400,1000),b=r(5,20),wait=r(1,35);return q('Arrive at '+ampm(a)+'. Walk '+b+' minutes to the bus stop. The bus leaves at '+ampm(a+b+wait)+'. After the walk, how many minutes remain before departure?',wait)},'g4-elapsed');
 add(4,'g4-timecompare','Compare trip durations','4.MD.A.2',()=>{let a=r(400,700),b=r(800,1000),c=r(20,120),d=r(20,120);return q('Trip A: '+ampm(a)+' to '+ampm(a+c)+'. Trip B: '+ampm(b)+' to '+ampm(b+d)+'. Both are same-day AM/PM times. How many minutes longer is the longer trip? Enter 0 if equal.',Math.abs(c-d))},'g4-elapsed');
 add(4,'g4-timebudget','Repeated durations and time budgets','4.MD.A.2',()=>{let setup=r(5,20),n=r(3,8),cycle=r(4,15),left=r(0,30),total=setup+n*cycle+left;return q('You have '+total+' minutes. Setup takes '+setup+' minutes, then '+n+' cycles take '+cycle+' minutes each. How many minutes remain?',left)},'g4-multistep');
 // Grade 5
 add(5,'g5-order','Order of operations: parentheses, no exponents','5.OA.A.1',()=>{let a=r(2,12),b=r(2,9),c=r(2,9),d=r(1,9);return r(0,1)?calc('('+a+' + '+b+') × '+c+' − '+d*c+' ÷ '+c,(a+b)*c-d):calc(a*b+' ÷ '+b+' × '+c+' + ('+d+' − 1)',a*c+d-1)},'g4-multistep');
 add(5,'g5-write','Write numerical expressions','5.OA.A.2',()=>{let a=r(2,12),b=r(2,9),c=r(2,9);return q('Write an expression for '+c+' times the sum of '+a+' and '+b+'. Do not give only the result.',c+'*('+a+'+'+b+')','expression')},'g5-order');
 add(5,'g5-pattern','Related numerical patterns','5.OA.B.3 textual component',()=>{let a=r(2,6),b=r(7,12),n=r(3,9);return q('Two patterns start at 0. A adds '+a+' each step; B adds '+b+'. After '+n+' steps, how much greater is B than A?',(b-a)*n)},'g4-pattern');
 add(5,'g5-place','Decimal place value','5.NBT.A.1,3',()=>{let a=r(1001,9999),p=pick([10,100,1000]);return q('In '+decimal(a,1000)+', what is the value of the '+({10:'tenths',100:'hundredths',1000:'thousandths'}[p])+' digit?',Math.floor(a/(1000/p))%10/p)});
 add(5,'g5-powers10','Powers of ten and decimal shifts','5.NBT.A.2',()=>{let a=r(1,9999),n=r(1,3),div=r(0,1);return calc(decimal(a)+' '+(div?'÷':'×')+' 10^'+n,div?a/100/10**n:a/100*10**n)},'g4-decimal');
 add(5,'g5-deccompare','Compare decimals to thousandths','5.NBT.A.3',()=>comparison(decimal(r(1,9999),1000),decimal(r(1,9999),1000)),'g4-deccompare');
 add(5,'g5-round','Round decimals','5.NBT.A.4',()=>{let a=r(1,99999),p=pick([1,10,100]),step=1000/p;return q('Round '+decimal(a,1000)+' to the nearest '+({1:'whole number',10:'tenth',100:'hundredth'}[p])+'. If halfway, round up.',Math.floor((a+step/2)/step)/p)},'g4-round');
 add(5,'g5-mul','Multi-digit multiplication','5.NBT.B.5',()=>{let a=r(100,999),b=r(12,999);return calc(a+' × '+b,a*b)},'g4-mul');
 add(5,'g5-div','Two-digit divisor division','5.NBT.B.6',()=>{let b=r(12,99),a=r(12,99);return calc(a*b+' ÷ '+b,a)},'g4-div');
 for(const [id,name,op] of [['decadd','addition','+'],['decsub','subtraction','−'],['decmul','multiplication','×'],['decdiv','division','÷']])add(5,'g5-'+id,'Decimal '+name,'5.NBT.B.7',()=>{let a=r(100,999),b=r(10,99);if(op==='÷')return calc(decimal(a*b,1000)+' ÷ '+decimal(b,10),a/100);return calc(decimal(a)+' '+op+' '+decimal(b),op==='+'?(a+b)/100:op==='−'?(a-b)/100:a*b/10000)},'g4-'+(op==='+'?'add':op==='−'?'sub':op==='×'?'mul':'div'));
 add(5,'g5-fadd','Unlike-denominator fraction addition','5.NF.A.1',()=>{let d=den(),e=pick([2,3,4,5,6,8,10,12].filter(v=>v!==d)),a=r(1,d),b=r(1,e);return f(a+'/'+d+' + '+b+'/'+e,a*e+b*d,d*e)},'g4-fraction');
 add(5,'g5-fsub','Unlike-denominator fraction subtraction','5.NF.A.1',()=>{let d=den(),e=pick([2,3,4,5,6,8,10,12].filter(v=>v!==d)),a=r(1,d),b=r(1,e);if(a*e<b*d)[a,b,d,e]=[b,a,e,d];return f(a+'/'+d+' − '+b+'/'+e,a*e-b*d,d*e)},'g4-fsub');
 add(5,'g5-mixed','Mixed numbers with unlike denominators','5.NF.A.1',()=>{let d=den(),e=den(),a=r(3,7),b=r(1,2),n=r(1,d-1),m=r(1,e-1),sg=pick([1,-1]);return f(a+' '+n+'/'+d+(sg===1?' + ':' − ')+b+' '+m+'/'+e,(a*d+n)*e+sg*(b*e+m)*d,d*e)},'g5-fadd');
 add(5,'g5-fword','Fraction addition/subtraction word problems','5.NF.A.2',()=>{let d=den(),e=den();return f('A jug holds 1/'+d+' L. You add 1/'+e+' L. How many liters now?',d+e,d*e)},'g5-fadd');
 add(5,'g5-quotient','Fractions as quotients','5.NF.B.3',()=>{let a=r(2,12),b=r(2,12);return f(a+' loaves are shared equally by '+b+' people. How many loaves per person?',a,b)},'g4-equivalent');
 add(5,'g5-fmul','Fraction multiplication','5.NF.B.4',()=>{let d=den(),e=den(),a=r(1,d+2),b=r(1,e+2);return f(a+'/'+d+' × '+b+'/'+e,a*b,d*e)},'g4-fwhole');
 add(5,'g5-scale','Multiplication as scaling','5.NF.B.5',()=>{let a=r(3,20),n=r(1,12),d=den();return q('Compare '+a+' × '+n+'/'+d+' with '+a+'. Enter <, > or =.',cmp(n,d),'comparison')},'g5-fmul');
 add(5,'g5-fmulword','Fraction multiplication word problems','5.NF.B.6',()=>{let d=den(),a=r(1,d-1),b=r(2,12);return f('You use '+a+'/'+d+' of '+b+' kg of flour. How many kilograms do you use?',a*b,d)},'g5-fmul');
 add(5,'g5-divfrac','Whole number ÷ unit fraction','5.NF.B.7',()=>{let a=r(2,12),b=den();return calc(a+' ÷ (1/'+b+')',a*b)},'g4-mul');
 add(5,'g5-unitdiv','Unit fraction ÷ whole number','5.NF.B.7',()=>{let a=r(2,12),b=den();return f('(1/'+b+') ÷ '+a,1,a*b)},'g5-fmul');
 add(5,'g5-divword','Unit-fraction division word problems','5.NF.B.7',()=>{let a=r(2,12),b=den();return q(a+' L of juice fills cups holding 1/'+b+' L each. How many cups?',a*b)},'g5-divfrac');
 add(5,'g5-convert','Conversions in both directions','5.MD.A.1',()=>{let [a,b,k]=pick(units),n=r(1,100),div=r(0,1);return q(n+' '+(div?b:a)+' = how many '+(div?a:b)+'? (1 '+a+' = '+k+' '+b+'.) Give an exact value; fractions are allowed.',div?frac(n,k):n*k)},'g4-convert');
 add(5,'g5-word','Decimal money word problems','5.NBT.B.7',()=>{let p=r(125,499),n=r(2,5);return q(n+' notebooks cost $'+decimal(p)+' each. Total cost in dollars?',p*n/100)},'g5-decmul');
 // Grade 6
 add(6,'g6-ratio','Equivalent ratios: missing value','6.RP.A.1,3',()=>{let a=r(2,9),b=r(2,9),m=r(2,8);return q('Red:blue = '+a+':'+b+'. If there are '+a*m+' red beads, how many blue beads?',b*m)},'g4-mul');
 add(6,'g6-rate','Unit rates','6.RP.A.2',()=>{let n=r(2,9),v=r(3,15);return q(n+' kg costs $'+n*v+'. What is the cost in dollars per kg?',v)},'g4-div');
 add(6,'g6-ratecompare','Compare unit costs','6.RP.A.3',()=>{let n=r(2,9),m=r(2,9),a=r(2,12),b=r(2,12);return q('Pack A: '+n+' pens for $'+n*a+'. Pack B: '+m+' pens for $'+m*b+'. Compare cost per pen: A ___ B. Enter <, > or =.',cmp(a,b),'comparison')},'g6-rate');
 add(6,'g6-percent','Percent of a quantity','6.RP.A.3',()=>{let p=r(1,99),n=r(1,20)*100;return calc(p+'% of '+n,p*n/100)},'g5-fmul');
 add(6,'g6-percentwhole','Find the whole from a percent','6.RP.A.3',()=>{let p=r(1,19)*5,n=r(1,20)*100;return q(p+'% of a number is '+p*n/100+'. Find the number.',n)},'g6-percent');
 add(6,'g6-percentrate','Find the percentage','6.RP.A.3',()=>{let p=r(1,99),n=r(1,10)*100;return q(p*n/100+' is what percent of '+n+'? Enter the number without %.',p)},'g6-percent');
 add(6,'g6-represent','Fraction, decimal and percent conversions','6.RP.A.3',()=>{let a=r(1,99),v=r(0,2);return v===0?f('Write '+a+'% as a fraction.',a,100):v===1?q('Write '+a+'% as a decimal.',a/100,'decimal'):q('Write '+decimal(a)+' as a percent. Enter the number without %.',a)},'g4-dectofrac');
 add(6,'g6-convert','Ratio-based unit conversions','6.RP.A.3',()=>{let k=pick([2.54,1.6]),n=r(2,25);return q(n+' '+(k===2.54?'inches':'miles')+' = how many '+(k===2.54?'centimeters':'kilometers')+'? Use 1 '+(k===2.54?'inch = 2.54 cm':'mile = 1.6 km')+'.',Number((n*k).toFixed(2)))},'g5-decmul');
 add(6,'g6-word','Ratio word problems','6.RP.A.3',()=>{let a=r(2,5),b=r(6,9),m=r(2,8);return q('A recipe uses '+a+' cups of flour for '+b+' servings. Cups for '+b*m+' servings?',a*m)},'g6-rate');
 add(6,'g6-fdiv','Fraction division','6.NS.A.1',()=>{let a=r(1,9),b=den(),c=r(1,9),d=den();return f('('+a+'/'+b+') ÷ ('+c+'/'+d+')',a*d,b*c)},'g5-fmul');
 add(6,'g6-fdivword','Fraction division word problems','6.NS.A.1',()=>{let a=r(2,9),b=den(),c=r(1,5),d=den();return f('A machine uses '+c+'/'+d+' L each hour. How many hours will '+a+'/'+b+' L last?',a*d,b*c)},'g6-fdiv');
 add(6,'g6-longdiv','Multi-digit division','6.NS.B.2',()=>{let b=r(12,199),a=r(12,199);return calc(a*b+' ÷ '+b,a)},'g5-div');
 add(6,'g6-decops','Decimal operations fluency','6.NS.B.3',()=>{let a=r(101,9999),b=r(11,99),op=pick(['+','−','×','÷']);return op==='÷'?calc(decimal(a*b,10000)+' ÷ '+decimal(b),a/100):calc(decimal(a,1000)+' '+op+' '+decimal(b),op==='+'?(a+10*b)/1000:op==='−'?(a-10*b)/1000:a*b/100000)},'g5-decdiv');
 add(6,'g6-gcf','Greatest common factor','6.NS.B.4',()=>{let a=r(2,100),b=r(2,100);return q('Find the greatest common factor of '+a+' and '+b+'.',gcd(a,b))},'g4-factors');
 add(6,'g6-lcm','Least common multiple','6.NS.B.4',()=>{let a=r(2,12),b=r(2,12);return q('Find the least common multiple of '+a+' and '+b+'.',a*b/gcd(a,b))},'g4-multiples');
 add(6,'g6-negative','Signed quantities and opposites','6.NS.C.5–6',()=>{let n=r(1,50);return r(0,1)?q('A bank balance is '+n+' dollars below zero. Write the signed balance.',-n):q('What is the opposite of '+(-n)+'?',n)});
 add(6,'g6-compare','Compare signed rational numbers','6.NS.C.7',()=>comparison(frac(r(-20,20),den()),frac(r(-20,20),den())),'g4-fcompare');
 add(6,'g6-absolute','Absolute value','6.NS.C.7',()=>{let n=r(-100,100);return calc('|'+n+'|',Math.abs(n))},'g6-negative');
 add(6,'g6-exponents','Whole-number exponents','6.EE.A.1',()=>{let a=r(2,9),b=r(2,4);return calc(a+'^'+b,a**b)},'g4-mul');
 add(6,'g6-order','Order of operations: parentheses and exponents','6.EE.A.1',()=>{let a=r(2,7),b=r(2,4),c=r(2,6),d=r(2,9),e=r(1,9);return r(0,1)?calc('('+a+' + '+b+')^2 − '+c*d+' ÷ '+c+' + '+e+' × 2',(a+b)**2-d+e*2):calc(a*d+' ÷ '+d+' × '+c+' + ('+b+' + '+e+')^2',a*c+(b+e)**2)},'g5-order');
 add(6,'g6-eval','Evaluate expressions','6.EE.A.2',()=>{let a=r(2,9),x=r(2,12),b=r(1,15);return q('Evaluate '+a+'x + '+b+' when x = '+x+'.',a*x+b)},'g5-order');
 add(6,'g6-terms','Coefficients and terms','6.EE.A.2',()=>{let a=r(2,12),b=r(1,20);return q('In '+a+'x + '+b+', what is the coefficient of x?',a)});
 add(6,'g6-write','Write algebraic expressions','6.EE.A.2',()=>{let a=r(2,9),b=r(1,20);return q('Write an expression: '+b+' more than '+a+' times x.',a+'x+'+b,'expression')},'g6-eval');
 add(6,'g6-distribute','Distributive property','6.EE.A.3–4',()=>{let a=r(2,9),b=r(1,12);return q('Expand '+a+'(x + '+b+'). Give the expression without parentheses.',a+'x+'+a*b,'expanded')},'g6-write');
 add(6,'g6-combine','Combine like terms','6.EE.A.3–4',()=>{let a=r(2,9),b=r(2,9),c=r(1,12);return q('Simplify '+a+'x + '+b+'x + '+c+'. Write ax + b form.',(a+b)+'x+'+c,'linear')},'g6-write');
 add(6,'g6-eq','One-step equations','6.EE.B.5,7',()=>{let x=r(1,30),b=r(2,20),k=r(0,3);return q('Solve '+[('x + '+b+' = '+(x+b)),('x − '+b+' = '+(x-b)),(b+'x = '+b*x),('x ÷ '+b+' = '+frac(x,b))][k]+'. Enter x.',x)},'g4-sub');
 add(6,'g6-eqword','One-step equation word problems','6.EE.B.6–7',()=>{let x=r(3,20),b=r(2,9);return q(b+' equal-price tickets cost $'+b*x+'. What is one ticket price in dollars?',x)},'g6-eq');
 add(6,'g6-inequality','Write one-variable inequalities','6.EE.B.8',()=>{let a=r(2,30),greater=r(0,1);return q('Write an inequality: x is '+(greater?'greater':'less')+' than '+a+'.', 'x'+(greater?'>':'<')+a,'inequality')});
 add(6,'g6-relation','Dependent quantities from a rule','6.EE.C.9 textual component',()=>{let a=r(2,12),b=r(1,10),x=r(2,20);return q('Cost y is '+a+'x + '+b+' dollars for x rides. Find y for '+x+' rides.',a*x+b)},'g6-eval');
 // Grade 7
 add(7,'g7-fracrate','Unit rates with fractions','7.RP.A.1',()=>{let a=r(1,9),b=den(),c=r(1,9),d=den();return f('Travel '+a+'/'+b+' km in '+c+'/'+d+' hour. What is the speed in km per hour?',a*d,b*c)},'g6-fdiv');
 add(7,'g7-proportion','Proportional constants','7.RP.A.2',()=>{let k=r(2,20),x=r(2,10);return q('y is proportional to x. When x = '+x+', y = '+x*k+'. Find k in y = kx.',k)},'g6-rate');
 add(7,'g7-propequation','Write proportional equations','7.RP.A.2',()=>{let k=r(2,12);return q('An item costs $'+k+'. Write the cost of x items as an expression in x.',k+'x','expression')},'g6-write');
 add(7,'g7-propword','Proportion word problems','7.RP.A.2–3',()=>{let a=r(2,9),b=r(2,15),c=r(2,12);return q(a+' tickets cost $'+a*b+'. At that rate, what do '+c+' tickets cost in dollars?',b*c)},'g7-proportion');
 add(7,'g7-discount','Percent decrease','7.RP.A.3',()=>{let p=r(1,8)*5,n=r(2,40)*10;return q('A $'+n+' item has a '+p+'% discount. Sale price in dollars?',n*(100-p)/100)},'g6-percent');
 add(7,'g7-increase','Tax, tips and markup','7.RP.A.3',()=>{let p=r(1,20),n=r(2,40)*10;return q('A $'+n+' bill has '+p+'% '+pick(['tax','tip'])+' added. Total in dollars?',n*(100+p)/100)},'g6-percent');
 add(7,'g7-change','Percent change','7.RP.A.3',()=>{let n=r(1,20)*100,p=r(1,50),sg=pick([1,-1]);return q('A price changes from $'+n+' to $'+n*(100+sg*p)/100+'. What is the percent '+(sg>0?'increase':'decrease')+'? Enter the number without %.',p)},'g6-percentrate');
 add(7,'g7-interest','Simple interest','7.RP.A.3',()=>{let p=r(1,20)*100,rate=r(1,9),t=r(1,5);return q('$'+p+' earns simple interest at '+rate+'% per year for '+t+' years. How many dollars of interest (not total balance)?',p*rate*t/100)},'g6-percent');
 add(7,'g7-percentmulti','Successive percent changes','7.RP.A.3',()=>{let n=r(1,20)*100,p=r(1,5)*5,t=r(1,10);return q('A $'+n+' item is discounted '+p+'%, then '+t+'% tax is added to the discounted price. Final dollars? Round to the nearest cent only at the end (half up).',Math.round(n*(100-p)*(100+t)/100)/100)},'g7-discount');
 add(7,'g7-percenterror','Percent error','7.RP.A.3',()=>{let n=r(1,10)*100,p=r(1,30);return q('Actual length is '+n+' cm; an estimate is '+(n+n*p/100)+' cm. What is the percent error? Enter the number without %.',p)},'g6-percentrate');
 for(const [id,name,op] of [['intadd','addition','+'],['intsub','subtraction','−'],['intmul','multiplication','×'],['intdiv','division','÷']])add(7,'g7-'+id,'Signed-number '+name,'7.NS.A.1–2',()=>{let a=r(-30,30),b=pick([-12,-9,-6,-3,2,4,7,10]);return op==='÷'?calc(a*b+' ÷ ('+b+')',a):calc(a+' '+op+' ('+b+')',op==='+'?a+b:op==='−'?a-b:a*b)},op==='+'||op==='−'?'g6-negative':'g4-mul');
 add(7,'g7-rational','Signed fraction operations','7.NS.A.1–2',()=>{let a=r(-12,12),b=den(),c=pick([-9,-7,-4,-1,2,3,6,8]),d=den(),op=pick(['+','−','×','÷']);return f('('+frac(a,b)+') '+op+' ('+frac(c,d)+')',op==='+'?a*d+c*b:op==='−'?a*d-c*b:op==='×'?a*c:a*d,op==='÷'?b*c:b*d)},'g6-fdiv');
 add(7,'g7-signeddec','Signed decimal operations','7.NS.A.1–2',()=>{let a=r(-999,999),b=pick([-12,-5,-2,3,7,11]),op=pick(['+','−','×','÷']);return op==='÷'?calc(decimal(a*b)+' ÷ ('+b+')',a/100):calc(decimal(a)+' '+op+' ('+decimal(b,10)+')',op==='+'?(a+10*b)/100:op==='−'?(a-10*b)/100:a*b/1000)},'g7-intadd');
 add(7,'g7-decimal','Rational numbers as decimals','7.NS.A.2',()=>{let d=pick([2,4,5,8,10,20,25]),n=r(-30,30);return q('Write '+n+'/'+d+' as a decimal.',n/d,'decimal')},'g4-decimal');
 add(7,'g7-repeat','Repeating decimal notation','7.NS.A.2',()=>{let n=pick([1,2,4,5,7,8]);return q('Write '+n+'/9 as a repeating decimal. Put the repeating digit in parentheses, such as 0.(3).','0.('+n+')','repeating')},'g7-decimal');
 add(7,'g7-word','Signed-change word problems','7.NS.A.3',()=>{let a=r(-15,5),b=r(1,20),sg=pick([1,-1]);return q('Temperature is '+a+'°C. It '+(sg>0?'rises':'falls')+' '+b+'°C. New temperature in °C?',a+sg*b)},'g7-intadd');
 add(7,'g7-rationalword','Multistep rational-number word problems','7.NS.A.3',()=>{let a=r(-200,200),b=r(10,90),n=r(2,5);return q('Your account balance is $'+a+'. You make '+n+' purchases of $'+decimal(b,10)+' each. What is the signed new balance in dollars?',a-n*b/10)},'g7-signeddec');
 add(7,'g7-expression','Combine signed rational like terms','7.EE.A.1',()=>{let a=r(-9,-1),b=r(2,12),c=r(-10,10);return q('Simplify '+a+'x + '+b+'x + ('+c+'). Write ax + b form.',(a+b)+'x'+(c>=0?'+':'')+c,'linear')},'g6-combine');
 add(7,'g7-distribute','Expand signed expressions','7.EE.A.1',()=>{let a=r(-9,-2),b=r(1,12);return q('Expand '+a+'(x − '+b+'). Give the expression without parentheses.',a+'x+'+(-a*b),'expanded')},'g6-distribute');
 add(7,'g7-factor','Factor linear expressions','7.EE.A.1',()=>{let a=r(2,9),b=r(1,9);return q('Factor '+a+'x + '+a*b+' completely using the greatest positive integer common factor.',a+'*(x+'+b+')','factored')},'g6-gcf');
 add(7,'g7-rewrite','Rewrite percent expressions','7.EE.A.2',()=>{let p=r(1,40);return q('A price x increases by '+p+'%. Write the new price as one number multiplied by x.',decimal(100+p)+'x','linear')},'g7-increase');
 add(7,'g7-eval','Evaluate signed rational expressions','7.EE.A.1–2',()=>{let x=r(-9,-1),a=r(2,5),b=r(-10,10);return q('Evaluate '+a+'x^2 + ('+b+') when x = '+x+'.',a*x*x+b)},'g6-order');
 add(7,'g7-eq','Two-step equations','7.EE.B.4',()=>{let a=pick([-9,-5,-2,2,4,7]),b=r(-20,20),x=r(-10,10);return q('Solve '+a+'x + ('+b+') = '+(a*x+b)+'. Enter x.',x)},'g6-eq');
 add(7,'g7-eqgroup','Equations with parentheses','7.EE.B.4',()=>{let a=pick([-6,-3,2,5]),b=r(-9,9),x=r(-10,10);return q('Solve '+a+'(x + ('+b+')) = '+a*(x+b)+'. Enter x.',x)},'g7-eq');
 add(7,'g7-eqfrac','Equations with rational coefficients','7.EE.B.4',()=>{let a=r(2,9),b=r(1,10),x=r(-10,10)*a;return q('Solve x/'+a+' + '+b+' = '+(x/a+b)+'. Enter x.',x)},'g7-eq');
 add(7,'g7-eqword','Two-step equation word problems','7.EE.B.3–4',()=>{let a=r(2,9),b=r(5,30),x=r(2,12);return q('A rental costs $'+b+' plus $'+a+' per hour. Total is $'+(b+a*x)+'. How many hours?',x)},'g7-eq');
 add(7,'g7-inequality','Solve two-step inequalities','7.EE.B.4',()=>{let a=pick([-5,-3,2,4]),b=r(-10,10),x=r(-10,10),op=pick(['<','>','≤','≥']),flip={'<':'>','>':'<','≤':'≥','≥':'≤'};return q('Solve '+a+'x + ('+b+') '+op+' '+(a*x+b)+'. Give the solution as an inequality in x.','x'+(a<0?flip[op]:op)+x,'inequality')},'g7-eq');
 add(7,'g7-ineqword','Inequality word problems','7.EE.B.4',()=>{let a=r(2,8),b=r(5,20),x=r(3,12);return q('You have $'+(a*x+b)+'. A fee is $'+b+' plus $'+a+' per ride. What is the greatest whole number of rides you can afford?',x)},'g7-inequality');

 add(7,'g7-rationalcoeff','Simplify rational-coefficient expressions','7.EE.A.1',()=>{let a=r(-9,9),b=r(1,9),c=r(-9,9);return q('Simplify '+decimal(a,10)+'x + '+decimal(b,10)+'x + ('+decimal(c,10)+'). Write ax + b form.',decimal(a+b,10)+'x'+(c>=0?'+':'')+decimal(c,10),'linear')},'g7-expression');
 add(7,'g7-fraceq','Equations with fractional coefficients','7.EE.B.4',()=>{let a=r(2,7),b=den(),x=r(-6,6)*b,c=r(-9,9);return q('Solve ('+frac(a,b)+')x + ('+c+') = '+(a*x/b+c)+'. Enter x.',x)},'g7-eqfrac');
 add(6,'g6-ordering','Order rational numbers without a number line','6.NS.C.7',()=>{let a=frac(r(-20,20),den()),b=frac(r(-20,20),den()),c=decimal(r(-99,99),10);return q('What is the least of '+a+', '+b+' and '+c+'? Give an exact value.',[a,b,c].sort((x,y)=>value(x)-value(y))[0])},'g6-compare');
 add(4,'g4-unitfraction','Fraction decomposition into unit fractions','4.NF.B.3',()=>{let d=den(),n=r(2,12);return q('How many copies of 1/'+d+' make '+n+'/'+d+'?',n)},'g4-fraction');
 add(5,'g5-festimate','Estimate fraction sums','5.NF.A.2',()=>{let d=den(),e=den(),a=r(1,d-1),b=r(1,e-1);return q('Estimate '+a+'/'+d+' + '+b+'/'+e+' by rounding EACH fraction to the nearest whole number first (half up). Enter the estimated sum.',Math.round(a/d)+Math.round(b/e))},'g5-fadd');
 add(4,'g4-timedeadline','Time limits and latest departures','4.MD.A.2',()=>{let end=r(600,1100),walk=r(5,20),ride=r(20,80);return q('You must arrive by '+ampm(end)+'. Walking takes '+walk+' minutes and the bus trip takes '+ride+' minutes, with no wait. What is the latest starting time? Enter h:mm AM or PM.',ampm(end-walk-ride),'time12')},'g4-timeback');
 add(4,'g4-midnightend','Ending times across midnight','4.MD.A.2',()=>{let start=r(1320,1439),d=r(1440-start,300);return q('Start at '+ampm(start)+' Monday. Continue for '+d+' minutes. What time on Tuesday do you finish? Enter h:mm AM or PM.',ampm(start+d),'time12')},'g4-timeforward');
 // Preserve the grade sequence, including additions made after initial declarations.
 list.find(s=>s.id==='g4-notation').optional24=true;
 for(const [id,pre] of Object.entries({'g4-add':'g3-add','g4-sub':'g3-sub','g4-div':'g3-div','g4-equivalent':'g3-reduce','g4-elapsed':'g3-time-addsubtract'}))list.find(s=>s.id===id).prereq=pre;
 list.sort((a,b)=>a.grade-b.grade);
 // Safe, non-evaluating answer parsers.
 function value(s){s=String(s).trim().replace(/−/g,'-');let m=s.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);if(m)return +m[4]?(m[1]?-1:1)*(+m[2]+m[3]/m[4]):NaN;m=s.match(/^(-?\d+)\s*\/\s*(\d+)$/);if(m)return +m[2]?m[1]/m[2]:NaN;return /^-?(\d+(\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN}
 function polynomial(text){
  const s=String(text).toLowerCase().replace(/−/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/\s+/g,'');
  if(!s||s.length>100)return null;const raw=s.match(/\d*\.\d+|\d+|[x()+*/^\-]/g);if(!raw||raw.join('')!==s)return null;
  const ts=[];for(const t of raw){let last=ts.at(-1);if(last&&(last==='x'||last===')'||/^\d|^\./.test(last))&&(t==='x'||t==='('))ts.push('*');ts.push(t)}let i=0;
  const trim=a=>{while(a.length>1&&Math.abs(a.at(-1))<1e-10)a.pop();return a};
  const sum=(a,b,sg=1)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+sg*(b[i]||0)));
  const mul=(a,b)=>{if(a.length+b.length>10)throw Error();let c=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>c[i+j]+=x*y));return trim(c)};
  function atom(){const t=ts[i++];if(t==='('){const a=expr();if(ts[i++]!==')')throw Error();return a}if(t==='x')return [0,1];if(t&&/^\d|^\./.test(t))return [+t];throw Error()}
  function power(){let a=atom();if(ts[i]==='^'){i++;const n=ts[i++];if(!/^[0-5]$/.test(n))throw Error();const b=a;a=[1];for(let k=0;k<+n;k++)a=mul(a,b)}return a}
  function unary(){if(ts[i]==='+'){i++;return unary()}if(ts[i]==='-'){i++;return unary().map(x=>-x)}return power()}
  function term(){let a=unary();while(ts[i]==='*'||ts[i]==='/'){const op=ts[i++],b=unary();if(op==='*')a=mul(a,b);else{if(b.length!==1||!b[0])throw Error();a=a.map(x=>x/b[0])}}return a}
  function expr(){let a=term();while(ts[i]==='+'||ts[i]==='-'){const op=ts[i++];a=sum(a,term(),op==='+'?1:-1)}return a}
  try{const a=trim(expr());return i===ts.length&&a.every(Number.isFinite)?a:null}catch{return null}
 }
 function inequality(s){s=String(s).replace(/\s+/g,'').replace(/−/g,'-').replace(/<=/g,'≤').replace(/>=/g,'≥');let m=s.match(/^x([<>≤≥])(-?(?:\d+(?:\.\d+)?|\d+\/\d+))$/);if(!m){m=s.match(/^(-?(?:\d+(?:\.\d+)?|\d+\/\d+))([<>≤≥])x$/);if(!m)return null;return [{'<':'>','>':'<','≤':'≥','≥':'≤'}[m[2]],value(m[1])]}return [m[1],value(m[2])]}
 function check(item,s){
  s=String(s).trim().replace(/−/g,'-');if(!s||s.length>100)return false;
  if(item.type==='comparison')return s===item.answer;
  if(item.type==='time12'){const m=s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);return !!m&&+m[1]>=1&&+m[1]<=12&&+m[2]<60&&ampm((+m[1]%12+(m[3].toUpperCase()==='PM'?12:0))*60+ +m[2])===item.answer}
  if(item.type==='time'){const m=s.match(/^(\d{1,2}):(\d{2})$/);return !!m&&+m[1]<24&&+m[2]<60&&clock(+m[1]*60+ +m[2])===item.answer}
  if(item.type==='repeating')return s.replace(/\s/g,'')===item.answer;
  // Every explicitly entered numeric fraction must be in lowest terms.
  for(const m of s.matchAll(/(\d+)\s*\/\s*(\d+)/g))if(!+m[2]||gcd(+m[1],+m[2])!==1)return false;
  if(item.type==='inequality'){let a=inequality(s),b=inequality(item.answer);return !!a&&!!b&&a[0]===b[0]&&Math.abs(a[1]-b[1])<1e-9}
  if(['expression','expanded','linear','factored'].includes(item.type)){
   let a=polynomial(s),b=polynomial(item.answer);if(!a||!b||a.length!==b.length||!a.every((v,i)=>Math.abs(v-b[i])<1e-9))return false;
   const compact=s.replace(/\s/g,'').replace(/[×·]/g,'*').replace(/÷/g,'/');if(item.type==='expression')return /[x+*/×÷()−-]/i.test(compact)&&!/^[-+]?\d+(\.\d+)?$/.test(compact);
   if(item.type==='expanded')return !/[()]/.test(compact);
   if(item.type==='linear'){const num='(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:/\\d+)?';return new RegExp('^[+-]?(?:'+num+'\\*?)?x(?:[+-]'+num+')?$|^[+-]?'+num+'$','i').test(compact)}
   return /^\d+\*?\(x\+\d+\)$/.test(compact)&&Number(compact.match(/^\d+/)[0])===Number(String(item.answer).match(/^\d+/)[0]);
  }
  const f=s.match(/^(?:-?\d+\s+)?(-?\d+)\s*\/\s*(\d+)$/);if(s.includes('/')&&!f)return false;
  if(item.type==='fraction'&&!f&&!/^-?\d+$/.test(s))return false;if(item.type==='decimal'&&s.includes('/'))return false;
  return Number.isFinite(value(s))&&Math.abs(value(s)-value(item.answer))<1e-9;
 }
 return {list,check,value,polynomial,clock,ampm};
})();

export { Skills };
