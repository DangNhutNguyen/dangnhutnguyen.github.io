# The First Line of Code That Learned to Look at the Sun

*Logbook 02 · 2023*

I did not come to AI through ChatGPT, a GPU, or a deep-learning course. I came to it through a patch of light.

In 2023, I worked on a research project focused on concentrated solar thermal power. The problem sounded direct: if thermal energy comes from direct sunlight, the optical reflector must stay precisely aligned with the solar disk throughout the day. But the sun never stays still in the sky, and mechanical arms have no inherent sense of how far they have drifted off-axis.

Somewhere between optical physics, mechanical linkages, and an unruly tangle of wiring, I had to write a program that could track the brightest celestial point and guide servo actuators to lock onto it.

![Schematic of Dual-Axis Solar Tracking System and closed-loop control architecture](assets/writings/solar-tracker-system.jpg)

## 1. When Code Steps Out of the Screen

In introductory programming classes, execution is well-behaved. Enter the right input, and the console spits out the exact expected value. If it fails, you step through a few lines in a debugger.

Real hardware is rarely that polite:
- Ambient light changes dynamically: transient cloud cover, specular ground reflection distort optical measurements.
- Physical linkages suffer from mechanical inertia, gearbox backlash, and frictional lag.
- A tiny micro-adjustment in software can turn into an erratic jerk on the tracker arm.
- An electromechanical system can fail in a dozen subtle ways without throwing a single red exception message.

That was the first time I realized: **coding for physical hardware requires embracing the noise and uncertainty of the real world.**

## 2. Closed-Loop Feedback and the Deadband Threshold

At the core of the dual-axis tracker is a closed-loop controller that reads four Light Dependent Resistors (LDRs) separated by an orthogonal shadow baffle, computing azimuth and elevation errors:

```cpp
#include <Servo.h>

// Sensor pin definitions for 4-quadrant optical array
const int PIN_LDR_TOP_LEFT     = A0;
const int PIN_LDR_TOP_RIGHT    = A1;
const int PIN_LDR_BOTTOM_LEFT  = A2;
const int PIN_LDR_BOTTOM_RIGHT = A3;

// Control hyperparameters
const int DEADBAND_THRESHOLD   = 15;   // Prevents motor jitter around equilibrium
const int STEP_DELAY_MS        = 25;   // Control loop sampling period

Servo servoAzimuth;    // East-West axis
Servo servoElevation;  // Altitude axis

int currentAzimuth = 90;
int currentElevation = 45;

void updateSolarTracker() {
    // 1. Sample irradiance across all four quadrants
    int tl = analogRead(PIN_LDR_TOP_LEFT);
    int tr = analogRead(PIN_LDR_TOP_RIGHT);
    int bl = analogRead(PIN_LDR_BOTTOM_LEFT);
    int br = analogRead(PIN_LDR_BOTTOM_RIGHT);

    // 2. Compute spatial hemifield averages
    int avgTop    = (tl + tr) / 2;
    int avgBottom = (bl + br) / 2;
    int avgLeft   = (tl + bl) / 2;
    int avgRight  = (tr + br) / 2;

    // 3. Compute directional error gradients
    int deltaElevation = avgTop - avgBottom;
    int deltaAzimuth   = avgLeft - avgRight;

    // 4. Update elevation axis with deadband deadzone
    if (abs(deltaElevation) > DEADBAND_THRESHOLD) {
        if (deltaElevation > 0 && currentElevation < 140) currentElevation++;
        else if (deltaElevation < 0 && currentElevation > 15) currentElevation--;
        servoElevation.write(currentElevation);
    }

    // 5. Update azimuth axis with deadband deadzone
    if (abs(deltaAzimuth) > DEADBAND_THRESHOLD) {
        if (deltaAzimuth > 0 && currentAzimuth < 175) currentAzimuth++;
        else if (deltaAzimuth < 0 && currentAzimuth > 5) currentAzimuth--;
        servoAzimuth.write(currentAzimuth);
    }
}
```

> [!NOTE]
> **Why the Deadband is Essential:** Without a minimal threshold (`DEADBAND_THRESHOLD`), noisy analog readings will cause servos to vibrate continuously (hunting/jitter). This parasitic oscillation wears out gears and wastes more electrical energy than the tracker recovers.

## 3. What "AI" Really Means in an Embedded System

I once thought the hard part would be figuring out how to insert fancy deep learning into the project. But buzzwords offer zero leverage when fundamental problem formulation remains fuzzy.

In reality, the entire system can be decomposed into five stages:
1. **Perception:** Reading optical intensity gradients across sensors.
2. **Localization:** Determining the geometric centroid of maximum irradiance.
3. **Error Analysis:** Comparing observed focal position with the normal vector of the dish.
4. **Actuation:** Emitting PWM pulses to rotate mechanical linkages.
5. **Feedback Loop:** Re-evaluating whether that adjustment actually improved solar concentration.

Step five was the most transformative. Without closed feedback, a system is merely blindly guessing and acting. With feedback, it begins to act like an autonomous agent capable of self-correction.

## 4. Reflections from the Field

The project went on to earn **First Prize at Provincial ViSEF** and **Second Prize at Provincial VIFOTEC** in 2023. Those accolades were deeply encouraging for a high-school student exploring engineering. But what stayed with me longest was not the awards—it was the quiet realization that software could:
- Sense the physical environment,
- Make reasoned autonomous decisions,
- Cause deliberate, physical movement toward the sun.

Before that project, programming lived inside a rectangular screen. Afterward, that barrier collapsed. Code became a primary instrument for building real-world systems.
