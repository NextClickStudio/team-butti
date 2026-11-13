# occluders in front of the wheels (half-res pixel coords): they stay put while the wheel turns under them
def V(pts, ox, oy, s): return [(ox + x / s, oy + y / s) for x, y in pts]
FRONT = V([(150, 0), (245, 0), (268, 70), (305, 180), (352, 300), (402, 400), (442, 478), (508, 495), (520, 605), (425, 625), (365, 668), (245, 660), (236, 525), (214, 470), (214, 380), (232, 300), (205, 252), (193, 182), (158, 120)], 1240, 1240, 1.6)
REAR = V([(150, 420), (175, 385), (245, 298), (300, 288), (560, 248), (760, 212), (790, 330), (640, 425), (455, 495), (445, 565), (340, 605), (245, 600), (232, 482), (150, 478)], 180, 1280, 1.4)
# sprung parts inside REAR, just above the front of the swingarm (footpeg bracket, boot heel): they stay with the body
SPRUNG = [(686, 1418), (790, 1418), (790, 1468), (686, 1468)]
