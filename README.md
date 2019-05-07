
Welcome to my Senior Design project, the Galapagos Simulator!

You can find my live demo at https://tabathah.github.io/Galapagos-Simulator/.

You can also find a short video I recorded about my project at https://vimeo.com/334051639.

# Galapagos Simulator

Ecosystems are complex and delicate networks with elements that continually interact, causing adaptations and creating a never-ending evolutionary process. The Galapagos Islands are unique in their isolation from most human influences. This has limited the species present on each island to an extent that it is very easy to analyze the causes of certain species’ adaptations. I wanted to create a simulation of this evolutionary process through several modes of procedural modeling, focusing on a few particular species that will articulate the process best. I used several techniques to create a Galapagos Island’s environment, focusing particularly on giant tortoises, Opuntia cacti, and some form of ambient vegetation. Tasks included procedural generation of cacti influenced by tortoise predation, procedural placement of vegetation based on environmental factors and predation, and basic artificial life for tortoises.

**L-System Opuntia Cacti:**

An L-System is a rule-based process for creating procedural models. You must create a starting axiom string and a set of rules which detail how each symbol expands into other symbols. The axiom is iterated upon for some n iterations. For each iteration, every symbol in the string is replaced with the symbols it corresponds to in the rule set. After these n iterations, you have a final string which will act as directions for creating a procedural model. To get more complex and random models, one can use stochastic L-Systems where a symbol can have multiple rules and the rule that will be used when expanding the string must be randomly chosen.

In my cactus L-Systems, I used the following symbols:

T: draw a bark piece in the current position and direction

S: draw a cactus cylinder in the current position and direction

C: draw a cactus fruit in the current position and direction

+: rotate about the world x-axis by some random angle

-: rotate about the world y-axis by some random angle

[: start a new branch

]: end the current branch and return to the position and direction where this one started

I created a rule system which encourages more fruit to be created and for fruit to branch off one another, which created a fairly convincing cactus model.

The bark pieces are generated separately from the rest of the L-System. The number of bark pieces is determined by an edibility probability which is at first is randomly generated. The lower the edibility, the more bark pieces should be added.

On an aesthetic note, I created the bark mesh in Maya and rotated them by a random amount, creating varied and interesting bark patterns. The cacti fruit have spikes whose distribution is determined by a 3D worley noise function.

**Tortoise Animation:**

The tortoises' movement is determined through behavioral animation. At each time step, each tortoise will choose to move at all with random probability. This creates a slower, more tortoise-like movement. If they do decide to move, three vectors are calculated to decide the direction they will go. First, an arrival vector. This is found by looping through all the cacti in the scene and calculating the distance between this tortoise and those cacti. The vector returned is the one in the direction of the closest cactus. This causes the tortoises to move toward the cacti which they want to eat. Second, a separation vector, calculated by looping through each of the other tortoises and negating the average vector toward them. This should keep the tortoises from running right into each other. Third and finally, a wander vector which is just calculated randomly. This adds natural deviation to the tortoises' movement.

In the GUI dropdown you might notice a speed slider. If speed is reduced, the time step at which tortoises are asked to move increases in frequency and the simulation will speed up. 

**L-System and Tortoise Interaction:**

In addition to the previously mentioned edibility value, cacti have a life variable. Whenever a turtle is within a small distance of a cactus, its life reduces until it eventually dies, at which time it disappears and a new cactus appears. When a new cactus is generated, it appears in a new random location and its edibility value, used to decide how much bark is in the cactus, is determined by the average of the edibility values of all the remaining cacti in the environment. In addition, in the calculation of the tortoise arrival vector, cacti are considered as the closest goal with a probability equal to their edibility. With all these factors are combined, it is easy to see that over time, the cacti as a population should evolve to have more bark and thus more protection from the tortoises. This is a simple simulation of an evolutionary interaction that might happen in such an environment.
