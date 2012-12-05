{
    "levels" : [
	      { "name" : "Green Hill", "camera" : { "zoom" : 0.5 }, "entities" : [
									  { "id" : "ball1", "class" : "Circle", "model" : {"url" : "/img/ball.png"}, "position" : {"x" : 300, "y" : 500}, "scale" : 1, "rotation" : 0, "circle" : 32, "body" : 2 },
									  { "id" : "crate", "class" : "Box", "model" : {"url" : "/img/crate.jpg"}, "position" : {"x" : 350, "y" : 600}, "scale" : 0.5, "rotation" : 0, "box" : [32, 32], "body" : 2 },
									  { "id" : "platform1", "class" : "Platform", "model" : {"box" : [400 , 20]}, "position" : {"x" : 550, "y" : -100}, "scale" : 1, "rotation" : 0, "box" : [200, 10], "body" : 0 },
									  { "id" : "platform2", "class" : "Platform", "model" : {"box" : [400 , 20]}, "position" : {"x" : 150, "y" : 150}, "scale" : 1, "rotation" : 45, "box" : [200, 10], "body" : 0 },
									  { "id" : "platform3", "class" : "Platform", "model" : {"box" : [400 , 20]}, "position" : {"x" : 400, "y" : 450}, "scale" : 1, "rotation" : -45, "box" : [200, 10], "body" : 0 },
									  { "id" : "platform4", "class" : "Platform", "model" : {"box" : [150 , 20]}, "position" : {"x" : 800, "y" : 0}, "scale" : 1, "rotation" : -66, "box" : [75, 10], "body" : 0 }
									  ] },
	      { "name" : "Marble", "camera" : { "zoom" : 0.5 } },
	      { "name" : "Spring Yard", "camera" : { "zoom" : 0.5 } },
	      { "name" : "Labyrinth", "camera" : { "zoom" : 0.5 } },
	      { "name" : "Star Light", "camera" : { "zoom" : 0.5 } },
	      { "name" : "Scrap Brain", "camera" : { "zoom" : 0.5 } }
	      ],

	"sprites" : [
		   "kGameEngine/../resource/ball.png",
		   "kGameEngine/../resource/crate.jpg"
		   ],

	"id" : 0

}