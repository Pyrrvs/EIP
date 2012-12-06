{
    "levels" : [
        { "name" : "Green Hill", "camera" : { "zoom" : 0.5, "position" : {"x" : 0, "y" : 0} }, "entities" : [
            { "id" : "ball1", "class" : "Circle", "model" : {"url" : "/img/ball.png"}, "position" : {"x" : 300, "y" : 500}, "scale" : 1, "rotation" : 0, "body" : { "type" : 2, "circle" : 32 } },
            { "id" : "crate", "class" : "Box", "model" : {"url" : "/img/crate.jpg"}, "position" : {"x" : 350, "y" : 600}, "scale" : 0.5, "rotation" : 0, "body" : { "type" : 2, "box" : {"w" : 32, "h" : 32} } },
            { "id" : "platform1", "class" : "Platform", "model" : {"box" : {"w" : 400 , "h" : 20}}, "position" : {"x" : 550, "y" : -100}, "scale" : 1, "rotation" : 0, "body" : { "type" : 0, "box" : {"w" : 200, "h" : 10 } } },
            { "id" : "platform2", "class" : "Platform", "model" : {"box" : {"w" : 400 , "h" : 20}}, "position" : {"x" : 150, "y" : 150}, "scale" : 1, "rotation" : 45, "body" : { "type" : 0, "box" : {"w" : 200, "h" : 10 } } },
            { "id" : "platform3", "class" : "Platform", "model" : {"box" : {"w" : 400 , "h" : 20}}, "position" : {"x" : 400, "y" : 450}, "scale" : 1, "rotation" : -45, "body" : { "type" : 0, "box" : {"w" : 200, "h" : 10 } } },
            { "id" : "platform4", "class" : "Platform", "model" : {"box" : {"w" : 150 , "h" : 20}}, "position" : {"x" : 800, "y" : 0}, "scale" : 1, "rotation" : -66, "body" : { "type" : 0, "box" : {"w" : 75, "h" : 10 } } }
        ] },
        { "name" : "Marble", "camera" : { "zoom" : 0.5 }, "entities" : [
            { "id" : "platform1", "class" : "Platform", "model" : {"box" : {"w" : 400 , "h" : 20}}, "position" : {"x" : 550, "y" : -100}, "scale" : 1, "rotation" : 0, "body" : { "type" : 0, "box" : {"w" : 200, "h" : 10 } } },
            { "id" : "platform2", "class" : "Platform", "model" : {"box" : {"w" : 400 , "h" : 20}}, "position" : {"x" : 150, "y" : 150}, "scale" : 1, "rotation" : 45, "body" : { "type" : 0, "box" : {"w" : 200, "h" : 10 } } },
            { "id" : "platform3", "class" : "Platform", "model" : {"box" : {"w" : 400 , "h" : 20}}, "position" : {"x" : 400, "y" : 450}, "scale" : 1, "rotation" : -45, "body" : { "type" : 0, "box" : {"w" : 200, "h" : 10 } } },
            { "id" : "platform4", "class" : "Platform", "model" : {"box" : {"w" : 150 , "h" : 20}}, "position" : {"x" : 800, "y" : 0}, "scale" : 1, "rotation" : -66, "body" : { "type" : 0, "box" : {"w" : 75, "h" : 10 } } }
        ] },            
        { "name" : "Spring Yard", "camera" : { "zoom" : 0.5 } },
        { "name" : "Labyrinth", "camera" : { "zoom" : 0.5 } },
        { "name" : "Star Light", "camera" : { "zoom" : 0.5 } },
        { "name" : "Scrap Brain", "camera" : { "zoom" : 0.5 } }
    ],

    "classes" : [
        { "name" : "Mario", "group" : "Hero", "bodyType" : "Dynamic" },
        { "name" : "Plat1", "group" : "Platforms", "bodyType" : "Static" },
        { "name" : "Plat2", "group" : "Platforms", "bodyType" : "Static" },
        { "name" : "Plat3", "group" : "Platforms", "bodyType" : "Static" },
        { "name" : "Soldier", "group" : "Army", "bodyType" : "Dynamic" },
        { "name" : "Commander", "group" : "Army", "bodyType" : "Dynamic" },
        { "name" : "General", "group" : "Army", "bodyType" : "Dynamic" }
    ],

    "sprites" : [
        "kGameEngine/../resource/ball.png",
        "kGameEngine/../resource/crate.jpg"
    ],

    "id" : 0
}