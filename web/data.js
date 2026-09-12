const HOLES = [
    {n:1,  name:"Cypress Gate",   par:4, yards:392, hcp:9,  dog:-8,  water:0.18, island:false, theme:"oak"},
    {n:2,  name:"Bayou Bend",     par:5, yards:531, hcp:3,  dog:16,  water:0.42, island:false, theme:"water"},
    {n:3,  name:"Cathedral",      par:4, yards:418, hcp:5,  dog:0,   water:0.08, island:false, theme:"oak"},
    {n:4,  name:"Palmetto",       par:3, yards:164, hcp:15, dog:0,   water:0.22, island:false, theme:"cane"},
    {n:5,  name:"Cane Cut",       par:4, yards:401, hcp:11, dog:10,  water:0.16, island:false, theme:"cane"},
    {n:6,  name:"Alligator Run",  par:5, yards:548, hcp:1,  dog:-12, water:0.55, island:false, theme:"water"},
    {n:7,  name:"Spanish Beard",  par:4, yards:387, hcp:13, dog:6,   water:0.10, island:false, theme:"oak"},
    {n:8,  name:"Magnolia",       par:3, yards:191, hcp:17, dog:-4,  water:0.12, island:false, theme:"oak"},
    {n:9,  name:"Parish Line",    par:4, yards:436, hcp:7,  dog:8,   water:0.14, island:false, theme:"cane"},
    {n:10, name:"Cottonmouth",    par:4, yards:409, hcp:8,  dog:-14, water:0.28, island:false, theme:"water"},
    {n:11, name:"Lily Cut",       par:5, yards:512, hcp:4,  dog:11,  water:0.36, island:false, theme:"water"},
    {n:12, name:"Isle of Moss",   par:3, yards:168, hcp:16, dog:0,   water:0.82, island:true,  theme:"island"},
    {n:13, name:"Tabasco",        par:4, yards:375, hcp:14, dog:7,   water:0.15, island:false, theme:"cane"},
    {n:14, name:"Foggy Oaks",     par:4, yards:427, hcp:2,  dog:-6,  water:0.12, island:false, theme:"fog"},
    {n:15, name:"Pirogue",        par:3, yards:142, hcp:18, dog:0,   water:0.40, island:false, theme:"water"},
    {n:16, name:"Plantation",     par:5, yards:555, hcp:6,  dog:9,   water:0.20, island:false, theme:"oak"},
    {n:17, name:"Hurricane",      par:4, yards:388, hcp:12, dog:-18, water:0.24, island:false, theme:"fog"},
    {n:18, name:"Home Oaks",      par:4, yards:398, hcp:10, dog:0,   water:0.10, island:false, theme:"oak"}
  ];

  const CLUBS = [
    {id:"DR", name:"Driver", carry:265, roll:22, loft:10},
    {id:"3W", name:"3 Wood", carry:235, roll:18, loft:15},
    {id:"5W", name:"5 Wood", carry:215, roll:16, loft:18},
    {id:"4H", name:"4 Hybrid", carry:200, roll:12, loft:22},
    {id:"5I", name:"5 Iron", carry:185, roll:10, loft:26},
    {id:"6I", name:"6 Iron", carry:170, roll:9, loft:30},
    {id:"7I", name:"7 Iron", carry:155, roll:8, loft:34},
    {id:"8I", name:"8 Iron", carry:140, roll:7, loft:38},
    {id:"9I", name:"9 Iron", carry:125, roll:6, loft:42},
    {id:"PW", name:"Pitching", carry:110, roll:5, loft:46},
    {id:"SW", name:"Sand", carry:80, roll:3, loft:56},
    {id:"PT", name:"Putter", carry:14, roll:42, loft:3}
  ];

  const ROOMS = {
    gate: {
      title: "Mosswood Parish<br/>Golf Club",
      copy: "Eighteen holes under live oaks and Spanish moss. Play the bayou course from a tilted map — aim, pick a club, swing. Hole 12 is the island we built."
    },
    lounge: {
      title: "Lounge",
      copy: "Leather gone soft at the arms. Moss in the windows. Last night’s card still on the wall, a 5 scribbled on Alligator Run like a warning. Ceiling fan turning the heat around."
    },
    lockers: {
      title: "Lockers",
      copy: "Brass tags. Wet towels. Oaks outside the pane, Spanish beard hanging still until the wind finds it. Somebody left a 7-iron leaning like they meant to come back."
    },
    back: {
      title: "The back room",
      copy: "Keys. A radio that still finds weather. The book they don’t show the members — pin sheets, wind notes, who short-sided 12 and paid for it. Stage 1 lives in here."
    }
  };
