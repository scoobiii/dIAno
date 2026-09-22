import { NeuralLayer, NeuralNetworkState } from '../types/game';

export class NeuralNetwork {
  public inputSize: number = 8;
  public hidden1Size: number = 6;
  public hidden2Size: number = 4;
  public outputSize: number = 3;

  public layer1: NeuralLayer;
  public layer2: NeuralLayer;
  public layer3: NeuralLayer;

  public lastState: NeuralNetworkState = {
    inputs: [0, 0, 0, 0, 0, 0, 0, 0],
    hidden1: [0, 0, 0, 0, 0, 0],
    hidden2: [0, 0, 0, 0],
    outputs: [0, 0, 0],
  };

  constructor(
    layer1?: NeuralLayer,
    layer2?: NeuralLayer,
    layer3?: NeuralLayer
  ) {
    this.layer1 = layer1 || this.initLayer(this.inputSize, this.hidden1Size);
    this.layer2 = layer2 || this.initLayer(this.hidden1Size, this.hidden2Size);
    this.layer3 = layer3 || this.initLayer(this.hidden2Size, this.outputSize);
  }

  private initLayer(inputs: number, outputs: number): NeuralLayer {
    const weights: number[][] = [];
    const biases: number[] = [];

    // Xavier initialization
    const scale = Math.sqrt(2 / (inputs + outputs));

    for (let i = 0; i < inputs; i++) {
      weights[i] = [];
      for (let j = 0; j < outputs; j++) {
        weights[i][j] = (Math.random() * 2 - 1) * scale;
      }
    }

    for (let j = 0; j < outputs; j++) {
      biases[j] = (Math.random() * 2 - 1) * 0.1;
    }

    return { weights, biases };
  }

  // Tanh activation function (-1 to 1)
  private activate(x: number): number {
    return Math.tanh(x);
  }

  // Sigmoid activation for outputs (0 to 1)
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));
  }

  public feedForward(inputs: number[]): number[] {
    this.lastState.inputs = [...inputs];

    // Layer 1 (Input -> Hidden 1)
    const hidden1: number[] = [];
    for (let j = 0; j < this.hidden1Size; j++) {
      let sum = this.layer1.biases[j];
      for (let i = 0; i < this.inputSize; i++) {
        sum += inputs[i] * this.layer1.weights[i][j];
      }
      hidden1[j] = this.activate(sum);
    }
    this.lastState.hidden1 = hidden1;

    // Layer 2 (Hidden 1 -> Hidden 2)
    const hidden2: number[] = [];
    for (let j = 0; j < this.hidden2Size; j++) {
      let sum = this.layer2.biases[j];
      for (let i = 0; i < this.hidden1Size; i++) {
        sum += hidden1[i] * this.layer2.weights[i][j];
      }
      hidden2[j] = this.activate(sum);
    }
    this.lastState.hidden2 = hidden2;

    // Layer 3 (Hidden 2 -> Outputs)
    const outputs: number[] = [];
    for (let j = 0; j < this.outputSize; j++) {
      let sum = this.layer3.biases[j];
      for (let i = 0; i < this.hidden2Size; i++) {
        sum += hidden2[i] * this.layer3.weights[i][j];
      }
      outputs[j] = this.sigmoid(sum);
    }
    this.lastState.outputs = outputs;

    return outputs;
  }

  public clone(): NeuralNetwork {
    const cloneLayer = (l: NeuralLayer): NeuralLayer => ({
      weights: l.weights.map((row) => [...row]),
      biases: [...l.biases],
    });

    return new NeuralNetwork(
      cloneLayer(this.layer1),
      cloneLayer(this.layer2),
      cloneLayer(this.layer3)
    );
  }

  public mutate(mutationRate: number = 0.1, mutationStrength: number = 0.3): void {
    const mutateLayer = (l: NeuralLayer) => {
      for (let i = 0; i < l.weights.length; i++) {
        for (let j = 0; j < l.weights[i].length; j++) {
          if (Math.random() < mutationRate) {
            // Gaussian perturbation or random reset
            if (Math.random() < 0.85) {
              const delta = (Math.random() * 2 - 1) * mutationStrength;
              l.weights[i][j] += delta;
            } else {
              l.weights[i][j] = (Math.random() * 2 - 1) * 1.5;
            }
          }
        }
      }

      for (let j = 0; j < l.biases.length; j++) {
        if (Math.random() < mutationRate) {
          l.biases[j] += (Math.random() * 2 - 1) * mutationStrength;
        }
      }
    };

    mutateLayer(this.layer1);
    mutateLayer(this.layer2);
    mutateLayer(this.layer3);
  }

  public crossover(partner: NeuralNetwork): NeuralNetwork {
    const crossoverLayer = (l1: NeuralLayer, l2: NeuralLayer): NeuralLayer => {
      const weights: number[][] = [];
      for (let i = 0; i < l1.weights.length; i++) {
        weights[i] = [];
        for (let j = 0; j < l1.weights[i].length; j++) {
          weights[i][j] = Math.random() < 0.5 ? l1.weights[i][j] : l2.weights[i][j];
        }
      }
      const biases: number[] = [];
      for (let j = 0; j < l1.biases.length; j++) {
        biases[j] = Math.random() < 0.5 ? l1.biases[j] : l2.biases[j];
      }
      return { weights, biases };
    };

    return new NeuralNetwork(
      crossoverLayer(this.layer1, partner.layer1),
      crossoverLayer(this.layer2, partner.layer2),
      crossoverLayer(this.layer3, partner.layer3)
    );
  }

  // Pre-seed a sensible instinct so initial generations don't all die on frame 10
  public seedInitialInstinct(): void {
    // Weight connecting normalized distance (input 0) negatively to JUMP when distance is close
    // Invert input so high proximity triggers JUMP output
    // Obstacle height & ground elevation trigger JUMP
    // Mid bird triggers DUCK
    if (this.layer1.weights[0] && this.layer1.weights[0][0] !== undefined) {
      this.layer1.weights[0][0] = -2.5; // close obstacle activates hidden neuron 0
    }
    if (this.layer1.weights[2] && this.layer1.weights[2][0] !== undefined) {
      this.layer1.weights[2][0] = 2.0; // high cactus height activates hidden neuron 0
    }
    if (this.layer1.weights[3] && this.layer1.weights[3][1] !== undefined) {
      this.layer1.weights[3][1] = 2.5; // mid bird altitude activates hidden neuron 1 (duck detector)
    }

    // Connect hidden 0 strongly to JUMP output (index 0)
    if (this.layer2.weights[0] && this.layer2.weights[0][0] !== undefined) {
      this.layer2.weights[0][0] = 2.2;
    }
    if (this.layer3.weights[0] && this.layer3.weights[0][0] !== undefined) {
      this.layer3.weights[0][0] = 3.0; // Hidden 0 -> JUMP output
    }

    // Connect hidden 1 strongly to DUCK output (index 1)
    if (this.layer2.weights[1] && this.layer2.weights[1][1] !== undefined) {
      this.layer2.weights[1][1] = 2.5;
    }
    if (this.layer3.weights[1] && this.layer3.weights[1][1] !== undefined) {
      this.layer3.weights[1][1] = 3.0; // Hidden 1 -> DUCK output
    }
  }

  public static createRandom(): NeuralNetwork {
    const net = new NeuralNetwork();
    net.seedInitialInstinct();
    return net;
  }
}
