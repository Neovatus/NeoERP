"""NeoERP display translations; numbers are shared skeleton, not a national chart."""
# code | Danish | Finnish | Icelandic. Contract supplied names take precedence.
DATA='''
1|Aktiver|Vastaavaa|Eignir
2|Egenkapital og forpligtelser|Oma pääoma ja velat|Eigið fé og skuldir
3|Driftsindtægter|Liiketoiminnan tuotot|Rekstrartekjur
4|Vareforbrug|Myytyjen tavaroiden kulut|Vörukostnaður
5|Personaleomkostninger|Henkilöstökulut|Starfsmannakostnaður
6|Afskrivninger og driftsomkostninger|Poistot ja liiketoiminnan kulut|Afskriftir og rekstrarkostnaður
7|Andre driftsomkostninger|Muut liiketoiminnan kulut|Annar rekstrarkostnaður
8|Finansielle poster og skat|Rahoituserät ja tuloverot|Fjármagnsliðir og tekjuskattur
30|Salg|Myynti|Sala
31|Momsfrit og nulbeskattet salg|Veroton ja nollaverokannan myynti|Undanþegin sala og sala með núllskatti
32|Eksportsalg|Vientimyynti|Útflutningssala
37|Franchise- og provisionsindtægter|Franchise- ja provisiotuotot|Sérleyfis- og þóknunartekjur
38|Gevinster ved salg af anlægsaktiver|Pysyvien vastaavien myyntivoitot|Hagnaður af sölu fastafjármuna
39|Andre driftsindtægter|Muut liiketoiminnan tuotot|Aðrar rekstrartekjur
40|Materialer|Materiaalit|Efni
43|Handelsvarer|Kauppatavarat|Verslunarvörur
45|Underleverandører|Alihankinta|Undirverktakar
47|Produktionsomkostninger|Tuotantokulut|Framleiðslukostnaður
50|Lønninger|Palkat|Laun
54|Arbejdsgiverbidrag og pensioner|Sosiaalivakuutus- ja eläkekulut|Launatengd gjöld og lífeyrir
59|Andre personaleomkostninger|Muut henkilöstökulut|Annar starfsmannakostnaður
60|Afskrivninger og nedskrivninger|Poistot ja arvonalentumiset|Afskriftir og niðurfærslur
61|Fragt|Rahti|Frakt
63|Lokaler|Toimitilat|Húsnæði
64|Leje af udstyr og abonnementer|Laitevuokrat ja tilaukset|Leiga tækja og áskriftir
65|Småanskaffelser og forbrugsvarer|Pienhankinnat ja tarvikkeet|Smááhöld og rekstrarvörur
66|Reparation og vedligeholdelse|Korjaus ja kunnossapito|Viðgerðir og viðhald
67|Revision og rådgivning|Tilintarkastus ja asiantuntijapalvelut|Endurskoðun og ráðgjöf
68|Kontoromkostninger|Toimistokulut|Skrifstofukostnaður
69|Kommunikation|Viestintä|Fjarskipti
70|Bilomkostninger|Ajoneuvokulut|Bifreiðakostnaður
71|Rejser|Matkakulut|Ferðakostnaður
73|Salg og markedsføring|Myynti ja markkinointi|Sala og markaðssetning
74|Kontingenter og donationer|Jäsenmaksut ja lahjoitukset|Félagsgjöld og styrkir
75|Forsikring og garantier|Vakuutukset ja takuut|Tryggingar og ábyrgðir
76|Royalties og licenser|Rojaltit ja lisenssit|Þóknanir og leyfi
77|Andre omkostninger|Muut kulut|Annar kostnaður
78|Tab|Tappiot|Tap
80|Finansielle indtægter|Rahoitustuotot|Fjármagnstekjur
81|Finansielle omkostninger|Rahoituskulut|Fjármagnsgjöld
83|Skat af årets resultat|Tuloverot|Tekjuskattur
1010|Aktiverede udviklingsomkostninger|Aktivoidut kehittämismenot|Eignfærður þróunarkostnaður
1020|Software og licenser|Ohjelmistot ja lisenssit|Hugbúnaður og leyfi
1030|Varemærker og franchiserettigheder|Tavaramerkit ja franchisingoikeudet|Vörumerki og sérleyfisréttindi
1070|Udskudt skatteaktiv|Laskennallinen verosaaminen|Frestuð skatteign
1080|Goodwill|Liikearvo|Viðskiptavild
1090|Akkumulerede afskrivninger på immaterielle aktiver|Aineettomien hyödykkeiden kertyneet poistot|Uppsafnaðar afskriftir óefnislegra eigna
1100|Bygninger|Rakennukset|Byggingar
1109|Akkumulerede afskrivninger på bygninger|Rakennusten kertyneet poistot|Uppsafnaðar afskriftir bygginga
1130|Anlægsaktiver under udførelse|Keskeneräiset aineelliset hankinnat|Varanlegir rekstrarfjármunir í smíðum
1150|Grunde|Maa-alueet|Lóðir
1160|Indretning af lejede lokaler|Vuokratilojen perusparannukset|Endurbætur leiguhúsnæðis
1169|Akkumulerede afskrivninger på lejede lokaler|Vuokratilojen parannusten kertyneet poistot|Uppsafnaðar afskriftir endurbóta leiguhúsnæðis
1200|Produktionsanlæg og maskiner|Tuotantokoneet ja laitteet|Framleiðsluvélar og tæki
1209|Akkumulerede afskrivninger på maskiner|Koneiden kertyneet poistot|Uppsafnaðar afskriftir véla
1230|Motorkøretøjer|Ajoneuvot|Bifreiðar
1239|Akkumulerede afskrivninger på køretøjer|Ajoneuvojen kertyneet poistot|Uppsafnaðar afskriftir bifreiða
1250|Inventar og udstyr|Kalusteet ja varusteet|Innréttingar og búnaður
1259|Akkumulerede afskrivninger på inventar|Kalusteiden kertyneet poistot|Uppsafnaðar afskriftir innréttinga
1280|Computere og IT-udstyr|Tietokoneet ja IT-laitteet|Tölvur og upplýsingatæknibúnaður
1289|Akkumulerede afskrivninger på IT-udstyr|IT-laitteiden kertyneet poistot|Uppsafnaðar afskriftir upplýsingatæknibúnaðar
1290|Brugsretsaktiver|Käyttöoikeusomaisuuserät|Afnotaréttareignir
1299|Akkumulerede afskrivninger på brugsretsaktiver|Käyttöoikeusomaisuuden kertyneet poistot|Uppsafnaðar afskriftir afnotaréttareigna
1300|Kapitalandele i datterselskaber|Osuudet tytäryrityksissä|Eignarhlutir í dótturfélögum
1350|Andre langfristede investeringer|Muut pitkäaikaiset sijoitukset|Aðrar langtímafjárfestingar
1380|Langfristede lån til medarbejdere|Pitkäaikaiset lainasaamiset henkilöstöltä|Langtímalán til starfsmanna
1390|Langfristede deposita|Pitkäaikaiset vakuustalletukset|Langtímatryggingarfé
1400|Råvarer|Raaka-aineet|Hráefni
1420|Varer under fremstilling|Keskeneräiset tuotteet|Vörur í framleiðslu
1440|Færdigvarer|Valmiit tuotteet|Fullunnar vörur
1470|Varer under transport|Kuljetuksessa olevat tavarat|Vörur í flutningi
1475|Emballage og reservedele|Pakkausmateriaalit ja varaosat|Umbúðir og varahlutir
1490|Nedskrivning af ukurante varer|Vaihto-omaisuuden epäkuranttiusvaraus|Niðurfærsla úreltra birgða
1530|Optjente indtægter og kontraktaktiver|Kertyneet tuotot ja sopimusomaisuus|Áfallnar tekjur og samningseignir
1590|Andre tilgodehavender|Muut saamiset|Aðrar kröfur
1630|Forudbetalt selskabsskat|Ennakkoon maksettu tulovero|Fyrirframgreiddur tekjuskattur
1700|Forudbetalt husleje|Ennakkoon maksetut vuokrat|Fyrirframgreidd húsaleiga
1710|Forudbetalt forsikring|Ennakkoon maksetut vakuutukset|Fyrirframgreiddar tryggingar
1790|Andre forudbetalte omkostninger|Muut ennakkoon maksetut kulut|Annar fyrirframgreiddur kostnaður
1800|Kortfristede investeringer|Lyhytaikaiset sijoitukset|Skammtímafjárfestingar
1910|Småkasse|Pikkukassa|Smásjóður
1930|Bank, opsparing og indlån|Pankki, säästöt ja talletukset|Banki, sparnaður og innlán
2020|Overkurs ved emission|Ylikurssirahasto|Yfirverðsreikningur hlutafjár
2030|Ejerkapital|Omistajan pääoma|Eigandaframlög
2040|Private hævninger|Yksityisotot|Úttektir eiganda
2045|Reserve for opskrivninger|Arvonkorotusrahasto|Endurmatsreikningur
2048|Andre reserver|Muut rahastot|Aðrir varasjóðir
2100|Pensions- og personaleforpligtelser|Henkilöstöetuusvelvoitteet|Skuldbindingar vegna starfsmannakjara
2120|Udskudt skat|Laskennallinen verovelka|Frestuð skattskuld
2150|Garantihensættelser|Takuuvaraukset|Ábyrgðarskuldbindingar
2180|Andre hensættelser|Muut pakolliset varaukset|Aðrar skuldbindingar
2220|Banklån, langfristede|Pitkäaikaiset pankkilainat|Langtímabankalán
2230|Leasingforpligtelser, langfristede|Pitkäaikaiset leasingvelat|Langtímaleiguskuldir
2250|Lån fra ejere og ledelse|Lainat omistajilta ja johdolta|Lán frá eigendum og stjórnendum
2290|Andre langfristede forpligtelser|Muut pitkäaikaiset velat|Aðrar langtímaskuldir
2300|Kortfristet del af langfristede lån|Pitkäaikaisten lainojen lyhytaikainen osuus|Næsta árs afborganir langtímalána
2330|Leasingforpligtelser, kortfristede|Lyhytaikaiset leasingvelat|Skammtímaleiguskuldir
2380|Kassekredit|Tililuotto|Yfirdráttur
2800|Skyldigt udbytte|Osinkovelat|Ógreiddur arður
2950|Skyldige renter|Korkovelat|Áfallnir vextir
2960|Skyldige omkostninger|Kulujaksotukset|Áfallinn kostnaður
2970|Forudbetalte indtægter|Ennakkoon saadut tuotot|Fyrirfram innheimtar tekjur
2990|Andre kortfristede forpligtelser|Muut lyhytaikaiset velat|Aðrar skammtímaskuldir
3060|Faktureret fragt|Laskutetut toimituskulut|Innheimt flutningsgjöld
3100|Momsfrit og nulbeskattet salg|Veroton ja nollaverokannan myynti|Undanþegin sala og sala með núllskatti
3200|Eksportsalg|Vientimyynti|Útflutningssala
3700|Provisionsindtægter|Provisiotuotot|Þóknunartekjur
3710|Royaltyindtægter|Rojaltituotot|Tekjur af sérleyfisþóknunum
3720|Franchiseindtægter|Franchisingtuotot|Sérleyfistekjur
3730|Modtagne bidrag til markedsføringsfond|Saadut markkinointirahaston maksut|Móttekin framlög til markaðssjóðs
3800|Gevinst ved salg af anlægsaktiver|Pysyvien vastaavien myyntivoitot|Hagnaður af sölu fastafjármuna
3900|Offentlige tilskud|Julkiset avustukset|Opinberir styrkir
3910|Lejeindtægter|Vuokratuotot|Leigutekjur
3990|Andre indtægter|Muut tuotot|Aðrar tekjur
4000|Forbrug af råvarer|Raaka-aineiden kulutus|Hráefnisnotkun
4060|Fragt og told ved køb|Ostorahti ja tullit|Flutningskostnaður og tollar við innkaup
4500|Underleverandører|Alihankinta|Undirverktakar
4700|Indirekte produktionsomkostninger|Tuotannon yleiskulut|Óbeinn framleiðslukostnaður
4710|Energi og brændstof, produktion|Tuotannon energia ja polttoaine|Orka og eldsneyti til framleiðslu
5010|Overtid og bonus|Ylityökorvaukset ja bonukset|Yfirvinna og kaupaukar
5030|Ledelseshonorar|Johdon palkkiot|Stjórnunarþóknanir
5430|Fratrædelsesgodtgørelse|Työsuhteen päättymiskorvaukset|Starfslokagreiðslur
5900|Personalevelfærd|Henkilöstön hyvinvointikulut|Velferð starfsmanna
5910|Uddannelse|Koulutus|Starfsþjálfun
5920|Rekruttering|Rekrytointi|Ráðningar
6000|Afskrivninger på bygninger|Rakennusten poistot|Afskriftir bygginga
6010|Afskrivninger på maskiner, køretøjer og inventar|Koneiden, ajoneuvojen ja kalusteiden poistot|Afskriftir véla, bifreiða og innréttinga
6015|Afskrivninger på IT-udstyr|IT-laitteiden poistot|Afskriftir upplýsingatæknibúnaðar
6020|Afskrivninger på immaterielle aktiver|Aineettomien hyödykkeiden poistot|Afskriftir óefnislegra eigna
6030|Afskrivninger på brugsretsaktiver|Käyttöoikeusomaisuuden poistot|Afskriftir afnotaréttareigna
6050|Nedskrivninger|Arvonalentumistappiot|Niðurfærslutap
6100|Fragt og levering|Myynnin rahti ja toimituskulut|Flutnings- og afhendingarkostnaður
6300|Husleje|Vuokrat|Húsaleiga
6340|El, vand og varme|Sähkö, vesi ja lämpö|Rafmagn, vatn og hiti
6360|Rengøring og sikkerhed|Siivous ja turvallisuus|Þrif og öryggisgæsla
6400|Leje af udstyr og køretøjer|Laite- ja ajoneuvovuokrat|Leiga tækja og bifreiða
6420|Software- og cloudabonnementer|Ohjelmisto- ja pilvipalvelutilaukset|Hugbúnaðar- og skýjaáskriftir
6540|Småanskaffelser|Pienhankinnat|Smááhöld
6550|Forbrugsvarer|Kulutustarvikkeet|Rekstrarvörur
6600|Reparation af bygninger|Rakennusten korjaukset|Viðgerðir bygginga
6620|Reparation af udstyr|Laitteiden korjaukset|Viðgerðir tækja
6700|Revision|Tilintarkastuspalkkiot|Endurskoðun
6705|Regnskabsassistance|Kirjanpitopalkkiot|Bókhaldsþjónusta
6720|Juridisk og faglig rådgivning|Oikeudelliset ja asiantuntijapalvelut|Lögfræði- og sérfræðiráðgjöf
6790|Andre eksterne ydelser|Muut ulkopuoliset palvelut|Önnur aðkeypt þjónusta
6800|Kontorartikler|Toimistotarvikkeet|Skrifstofuvörur
6860|Møder og kurser|Kokoukset ja kurssit|Fundir og námskeið
6900|Telefon og internet|Puhelin ja internet|Sími og internet
6940|Porto og kurer|Posti ja kuriiri|Póstur og hraðsendingar
7000|Brændstof|Polttoaine|Eldsneyti
7020|Vedligeholdelse af køretøjer|Ajoneuvojen kunnossapito|Viðhald bifreiða
7040|Bilforsikring og afgifter|Ajoneuvovakuutukset ja verot|Bifreiðatryggingar og gjöld
7100|Rejser og overnatning|Matkat ja majoitus|Ferðir og gisting
7150|Måltider og diæter|Ateriat ja päivärahat|Máltíðir og dagpeningar
7300|Salgsprovisioner|Myyntiprovisiot|Söluþóknanir
7320|Reklame|Mainonta|Auglýsingar
7330|Bidrag til markedsføringsfond|Markkinointirahaston maksut|Framlög til markaðssjóðs
7350|Repræsentation|Edustuskulut|Risna
7400|Kontingenter og abonnementer|Jäsenmaksut ja tilaukset|Félagsgjöld og áskriftir
7420|Donationer|Lahjoitukset|Styrkir
7500|Forsikring|Vakuutukset|Tryggingar
7550|Garantiomkostninger|Takuukulut|Ábyrgðarkostnaður
7600|Royaltyomkostninger|Rojaltikulut|Sérleyfisþóknanir
7610|Franchiseomkostninger|Franchisingkulut|Sérleyfiskostnaður
7620|Licenser og tilladelser|Lisenssit ja luvat|Leyfisgjöld
7790|Andre omkostninger|Muut kulut|Annar kostnaður
7800|Tab ved salg af anlægsaktiver|Pysyvien vastaavien myyntitappiot|Tap af sölu fastafjármuna
8000|Udbytteindtægter|Osinkotuotot|Arðstekjur
8070|Andre finansielle indtægter|Muut rahoitustuotot|Aðrar fjármagnstekjur
8155|Renter på leasingforpligtelser|Leasingvelkojen korot|Vextir af leiguskuldum
8170|Andre finansielle omkostninger|Muut rahoituskulut|Önnur fjármagnsgjöld
8320|Udskudt skat|Laskennalliset verot|Frestaður tekjuskattur
'''
NAMES={cc:{} for cc in ('DK','FI','IS')}
for line in DATA.strip().splitlines():
 code,*names=line.split('|')
 for cc,name in zip(NAMES,names):NAMES[cc][code]=name
for cc,names in {'DK':['Renteindtægter','Renteomkostninger','Realiserede kursgevinster','Realiserede kurstab','Urealiserede kursgevinster','Urealiserede kurstab'], 'FI':['Korkotuotot','Korkokulut','Toteutuneet kurssivoitot','Toteutuneet kurssitappiot','Toteutumattomat kurssivoitot','Toteutumattomat kurssitappiot'], 'IS':['Vaxtatekjur','Vaxtagjöld','Innleystur gengishagnaður','Innleyst gengistap','Óinnleystur gengishagnaður','Óinnleyst gengistap']}.items():
 NAMES[cc].update(zip(['8050','8150','8060','8160','8061','8161'],names))
TAX_LOCAL={}
def names(cc,prefix,items):
 for line in items.strip().splitlines():
  suffix,name=line.split('|',1);TAX_LOCAL[prefix+suffix]=name
names('DK','DK-MOMS-','''
25|Salgsmoms, 25 %
0|Salg med nulmoms
EXPORT|Eksport af varer og ydelser
EU-GOODS|Salg af varer til EU
EU-GOODS-NR|Salg af varer til EU, uden EU-salg
EU-SVC|Salg af ydelser til EU
RC-DOM-SALE|Indenlandsk salg, omvendt betalingspligt
EXEMPT|Momsfrit salg
IN-25|Købsmoms, 25 %
IN-25-REP|Købsmoms, restaurationsydelser, 25 % fradrag
IN-25-NODED|Købsmoms uden fradrag
RC-EU-GOODS|Varekøb fra EU, omvendt betalingspligt
RC-EU-SVC|Ydelseskøb fra EU, omvendt betalingspligt
RC-NONEU-SVC|Ydelseskøb uden for EU, omvendt betalingspligt
RC-DOM|Indenlandsk køb, omvendt betalingspligt
IMPORT|Import af varer
EU-TRIANG|Trekantshandel
OUT-OF-SCOPE|Uden for momslovens anvendelsesområde
IN-25-50|Købsmoms, 50 % fradrag
IN-25-PRORATA|Købsmoms, forholdsmæssigt fradrag
''')
names('FI','FI-ALV-','''
STD|Yleinen verokanta
RED|Alennettu verokanta
10|Sanoma- ja aikakauslehdet, 10 %
0|Nollaverokannan myynti
EXPORT|Vientimyynti
EU-GOODS|Tavaroiden yhteisömyynti
EU-SVC|Palvelumyynti muihin EU-maihin
RC-CONSTR-SALE|Rakennuspalvelujen myynti, käännetty verovelvollisuus
EXEMPT|Arvonlisäveroton myynti
IN-STD|Ostojen ALV, yleinen verokanta
IN-RED|Ostojen ALV, alennettu verokanta
IN-10|Ostojen ALV, 10 %
IN-STD-NODED|Ostojen ALV, ei vähennysoikeutta
RC-EU-GOODS|Tavaroiden yhteisöhankinta
RC-EU-SVC|Palveluostot EU-maista
RC-NONEU-SVC|Palveluostot EU:n ulkopuolelta
IMPORT|Tavaroiden maahantuonti
RC-CONSTR|Rakennuspalvelujen ostot, käännetty verovelvollisuus
''')
names('IS','IS-VSK-','''
24|Útskattur, 24 %
11|Útskattur, 11 %
0|Velta skv. 12. gr.
EXPORT|Útflutningur
EXEMPT|Undanþegin starfsemi
IN-24|Innskattur, 24 %
IN-11|Innskattur, 11 %
IN-NODED|Innskattur án frádráttarréttar
RC-SVC-NODED|Þjónusta frá útlöndum án frádráttarréttar
RC-SVC-IMPORT|Þjónusta frá útlöndum tengd innflutningi
IMPORT-PAID|Innskattur greiddur við tollafgreiðslu
''')
