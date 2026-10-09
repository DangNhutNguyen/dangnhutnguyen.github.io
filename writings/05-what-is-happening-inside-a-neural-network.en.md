# What Is Actually Happening Inside a Neural Network?

*Logbook 05 · 2024*

A neural network used to be a rather polite box for me. I put data in, called a few framework functions, selected an optimizer, and waited for the accuracy to rise. If it went up, I was pleased. If it remained still, I changed the learning rate or looked for another notebook. It was enough to begin, but it left one slightly uncomfortable question: **What was actually happening inside the box?**

In 2024, I built a neural network from scratch and trained it on MNIST. I was not trying to create a digit classifier better than methods that had existed for years. I wanted to write enough of the process myself that I could no longer hide behind one library call.

![Multi-layer neural network architecture and backpropagation gradient flow](assets/writings/neural-network-from-scratch.jpg)

## 1. The Mathematical Engine Behind the Abstraction

Remove the decoration, and a basic layer receives an input $X$, multiplies it by weights $W$, adds a bias $b$, and passes the result through an activation function $\sigma$:

$$Z = X \cdot W + b$$
$$A = \sigma(Z)$$

The difficult part is not reading the equation on paper. It is turning that equation into code where every matrix has the right shape, data moves in the right direction, and numerical values do not explode or vanish after a few iterations.

I had to explicitly manage the mechanics frameworks usually handle in silence:
- What exact **shape** does each tensor maintain?
- On which axis is the batch dimension positioned $(N, D_{in})$?
- How is the bias vector broadcast across mini-batch matrices?
- Which intermediate activations must be cached during the forward pass for backpropagation?
- Is the loss computed per sample or averaged across the batch?

> [!NOTE]
> Many machine-learning bugs are fundamentally **accounting errors**. You lose track of where a quantity lives, how many times it was accumulated, or whether it was averaged over the correct tensor axis.

## 2. Implementing a Dense Layer from Scratch (NumPy)

Here is how I implemented a fully connected Linear Layer in pure Python, detailing both Forward Propagation and Backpropagation:

```python
import numpy as np

class DenseLayer:
    """
    Linear transform Z = X.W + b with analytical gradient backpropagation.
    """
    def __init__(self, in_features: int, out_features: int):
        # He / Kaiming normal initialization to maintain activation variance
        limit = np.sqrt(2.0 / in_features)
        self.weights = np.random.randn(in_features, out_features) * limit
        self.biases = np.zeros((1, out_features))
        
        # Cache buffers for the backward pass
        self.inputs_cache = None
        self.grad_weights = None
        self.grad_biases = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        x shape: (batch_size, in_features)
        output shape: (batch_size, out_features)
        """
        self.inputs_cache = x
        return np.dot(x, self.weights) + self.biases

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """
        grad_output: dL/dZ flowing backwards from the next layer
        Returns: dL/dX to be propagated to the preceding layer
        """
        batch_size = self.inputs_cache.shape[0]
        
        # Gradient w.r.t weights: dL/dW = X.T @ (dL/dZ)
        self.grad_weights = np.dot(self.inputs_cache.T, grad_output)
        
        # Gradient w.r.t biases: dL/db = sum(dL/dZ) across batch axis
        self.grad_biases = np.sum(grad_output, axis=0, keepdims=True)
        
        # Gradient w.r.t inputs: dL/dX = (dL/dZ) @ W.T
        grad_input = np.dot(grad_output, self.weights.T)
        return grad_input
```

The forward pass tells a story from raw features to class probabilities. Backpropagation asks me to tell that story backward: how does an error at the output loss relate to every individual parameter that preceded it?

On paper, the chain rule looks compact. In code, it becomes an explicit **chain of responsibility**. Each layer must receive the gradient arriving from ahead, compute its local Jacobian derivative, and project gradients backward.

One mismatched transpose (`.T`) or incorrect summation axis can break execution. Worse is when it runs silently: the model computes numbers, the loss floats, but no actual gradient descent happens.

> [!TIP]
> **Gradient Checking Discipline:** When writing backpropagation from scratch, always compare analytical gradients with finite-difference approximations on a toy network:
> 
> $$\frac{\partial L}{\partial \theta} \approx \frac{L(\theta + \epsilon) - L(\theta - \epsilon)}{2\epsilon}$$
> 
> If the relative error exceeds $10^{-6}$, your analytical backward formulation has a mathematical flaw.

## 3. When the Machine Finally Learns

There were nights when accuracy lingered at 10%. Times when gradients exploded into `NaN`. Times when fixing one tensor dimension broke three others. These errors were frustrating, but they stopped formulas from remaining dry symbols. Gradients were no longer arrows in slides—they were numeric vectors flowing through lines of code I wrote.

MNIST is so standard it has become the "Hello World" of vision. But that made it ideal: I did not need an exotic problem; I needed a rock-solid baseline where every failure stemmed purely from my own comprehension.

When the scratch network achieved 97% test accuracy after 15 epochs, it was not about bragging rights. It was the quiet satisfaction of seeing a mathematical machine obey the logical constraints I laid out.

## 4. Key Takeaways

A from-scratch project can easily breed the illusion that "I understand everything now" because of lines written. But verbose code is not proof of mastery. If I did it again, I would enforce:
1. **Isolated layer unit tests:** Test individual forward/backward passes on tiny matrices computable by hand.
2. **Overfit on 5 samples:** If a model cannot memorize a handful of inputs to near-zero loss, training on the full dataset is pointless.
3. **Monitor weight distributions:** Track gradient norms and activation histograms, not just the loss scalar.

Building from scratch did not make frameworks less valuable—it taught me why they were designed that way, and when to look beneath the surface to optimize.
