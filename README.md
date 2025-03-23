This simulates a fictional "pollination ecosystem", where pollinators interact with flowers and face environmental hazards. 


**Pollinator Behaviour**

- Activity: 
  - Crowd around flowers, leading to resource depletion and competition.
  - Pollinators with better speed and efficiency, thrive and reproduce.
  - Some pollinators explore new flowers across the environment, while others remain near known resource locations, balancing short-term gain with long-term success.
- Movement:
  - Pollinators move randomly across the environment.
  - If flowers are detected within a certain range, pollinators slow down and steer toward them.
- Flower Interaction:
  - Pollinators collect nectar from flowers upon reaching them.
- Reproduction:
  - Pollinators reproduce after consuming 3 units of nectar.
  - Reproduction only occurs when pollinators are in safe zones.
  - Offspring inherit traits such as size and speed with slight mutations.
- Hazard Zone Interaction:
  - Pollinators lose lifespan rapidly (5 units per frame) while in hazard zones.
- Death:
  - Pollinators die if their lifespan runs out, which happens when they fail to consume nectar before depletion.


**Environment**
- Flowers:
  - Static resources positioned randomly within the environment.
  - Provide nectar to pollinators and regenerate over time.
  - Flowers regenerate 1 nectar every 160 frames.
  - Hold up to 5 nectar units. 
  - Removed when overlapping with hazard zones >30%.
- Hazard Zones:
  - Hazard zones expand by 10 units in radius every 10 seconds, representing escalating environmental challenges.
- Safe Zones:
  - Regions where pollinators can reproduce.

