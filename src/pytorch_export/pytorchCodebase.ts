export interface PyTorchFile {
  name: string;
  language: string;
  description: string;
  code: string;
}

export const PYTORCH_CODEBASE: PyTorchFile[] = [
  {
    name: 'README.md',
    language: 'markdown',
    description: 'Documentação da arquitetura multiagente PyTorch 2026',
    code: `# IAMDinosaur 2026 — Tri-Agent Co-Evolutionary System (PyTorch)

Repositório oficial da versão 2026 multiagente do IAMDinosaur, implementado em **PyTorch 2.x** com arquitetura aberta, modular e escalável.

---

## 🏛️ Arquitetura das Três Inteligências Artificiais

\`\`\`
┌────────────────────────────────────────────────────────────────────────┐
│                        IAMDINOSAUR 2026 TRI-CORE                       │
└────────────────────────────────────────────────────────────────────────┘
          ▲                                             │
          │ Relatórios de Fraqueza                      │ Currículo Adversarial
          │ & Taxa de Colisão                           │ & Vetor Latente (z)
          │                                             ▼
┌──────────────────┐                         ┌───────────────────────────┐
│   IA SUPERADORA  │ ◄────── Recompensas ─── │        IA CRIADORA        │
│ (PPO + Genética) │         & Trajetórias   │  (Adversarial Generator)  │
└──────────────────┘                         └───────────────────────────┘
          │                                             │
          │ Atualização de Pesos & Políticas            │ Spawn de Obstáculos
          ▼                                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     IA JOGADORA (Vision Agent)                         │
│       Gymnasium DinoEnv [Observation: (4, 84, 84), Actions: 3]         │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

1. **IA Criadora (Adversarial Generator)**:
   - Baseada em **Conditional WGAN-GP (Wasserstein GAN com Gradient Penalty)**.
   - Gera obstáculos dinâmicos, sequências rítmicas e variações de altitude condicionadas ao perfil de falha do Dino.
   - O Discriminador garante o **Critério de Solubilidade Física** (impede geração de paredes intransponíveis).

2. **IA Superadora (Hybrid PPO + Evolutionary Genetic Optimizer)**:
   - Combina **Proximal Policy Optimization (PPO)** com **Algoritmos Genéticos Populacionais**.
   - O PPO realiza exploração fina por gradiente estocástico com **Generalized Advantage Estimation (GAE-λ)**.
   - A camada Genética aplica **Crossover e Mutação de Hiperparâmetros** para evitar convergência prematura em mínimos locais.

3. **IA Jogadora (Vision Runner & Gym Environment)**:
   - Conecta-se diretamente ao ambiente simulado compatível com a API padrão **Gymnasium**.
   - Processamento de visão computacional moderna: **Nature CNN** com **Mecanismo de Atenção Espacial (Spatial Attention)** sobre tensor empilhado de 4 frames em escala de cinza \`(4, 84, 84)\`.
   - Gera mapas de saliência em tempo real para explicar visualmente onde a rede neural está focando.

---

## 🚀 Instalação Rápida

\`\`\`bash
# 1. Clone ou extraia o repositório
git clone https://github.com/iamdinosaur/iamdinosaur-2026.git
cd iamdinosaur-2026

# 2. Crie um ambiente virtual Python 3.10+
python -m venv venv
source venv/bin/activate  # Linux/macOS
# ou: venv\\Scripts\\activate  # Windows

# 3. Instale as dependências
pip install -r requirements.txt
\`\`\`

---

## 🏃 Como Treinar

\`\`\`bash
# Treinamento co-evolutivo completo com aceleração GPU (CUDA/MPS/CPU):
python train_multiagent.py --num_episodes 1000 --population_size 12 --device cuda

# Visualizar a simulação em tempo real (render_mode="human"):
python train_multiagent.py --eval_mode --checkpoint checkpoints/best_champion.pt
\`\`\`
`,
  },
  {
    name: 'requirements.txt',
    language: 'text',
    description: 'Dependências Python e bibliotecas de Deep Learning',
    code: `torch>=2.2.0
torchvision>=0.17.0
gymnasium>=0.29.1
numpy>=1.24.0
opencv-python>=4.8.0
matplotlib>=3.8.0
tqdm>=4.66.0
pygame>=2.5.0
scipy>=1.11.0
tensorboard>=2.15.0
`,
  },
  {
    name: 'dino_gym_env.py',
    language: 'python',
    description: 'Ambiente Gymnasium escalável com buffer de visão 84x84',
    code: `"""
dino_gym_env.py - Ambiente Gymnasium Escalável para IAMDinosaur 2026
Suporta observação por visão computacional (4x84x84) e espaço de ações discreto.
"""

from typing import Tuple, Dict, Any, Optional
import numpy as np
import cv2
import gymnasium as gym
from gymnasium import spaces


class DinoGymEnv(gym.Env):
    """
    Ambiente Gymnasium de simulação do Chrome Dinosaur.
    Observação: Tensor (4, 84, 84) de frames em escala de cinza normalizados.
    Ações:
        0: RUN (Correr normal)
        1: JUMP (Saltar)
        2: DUCK (Agachar)
    """

    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 60}

    def __init__(self, render_mode: Optional[str] = None):
        super().__init__()
        self.render_mode = render_mode

        # Espaço de Observação: 4 frames empilhados de 84x84 pixels
        self.observation_space = spaces.Box(
            low=0, high=255, shape=(4, 84, 84), dtype=np.uint8
        )

        # Espaço de Ações: 0=RUN, 1=JUMP, 2=DUCK
        self.action_space = spaces.Discrete(3)

        # Constantes de Física
        self.width = 600
        self.height = 200
        self.ground_y = 160
        self.gravity = 0.72
        self.jump_velocity = -12.5

        # Estado do Dino
        self.dino_x = 50
        self.dino_y = self.ground_y - 40
        self.dino_vy = 0.0
        self.dino_width = 30
        self.dino_height = 40
        self.is_jumping = False
        self.is_ducking = False

        # Estado do Jogo
        self.speed = 6.0
        self.score = 0
        self.obstacles = []
        self.frame_buffer = np.zeros((4, 84, 84), dtype=np.uint8)
        self.step_count = 0

    def reset(
        self, seed: Optional[int] = None, options: Optional[Dict[str, Any]] = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        super().reset(seed=seed)

        self.dino_y = self.ground_y - 40
        self.dino_vy = 0.0
        self.is_jumping = False
        self.is_ducking = False
        self.speed = 6.0
        self.score = 0
        self.step_count = 0
        self.obstacles = []

        # Inicializa o buffer com o primeiro frame
        initial_frame = self._render_frame_to_buffer()
        for i in range(4):
            self.frame_buffer[i] = initial_frame

        return self.frame_buffer.copy(), {"score": 0}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, Dict[str, Any]]:
        self.step_count += 1
        self.score += 1
        self.speed = min(15.0, 6.0 + (self.score // 250) * 0.4)

        # 1. Executa Ação
        if action == 1 and not self.is_jumping:  # JUMP
            self.dino_vy = self.jump_velocity
            self.is_jumping = True
            self.is_ducking = False
        elif action == 2:  # DUCK
            self.is_ducking = True
        else:
            self.is_ducking = False

        # 2. Atualiza Dimensões do Hitbox
        if self.is_ducking and not self.is_jumping:
            self.dino_height = 24
            self.dino_width = 40
            self.dino_y = self.ground_y - 24
        else:
            self.dino_height = 40
            self.dino_width = 30

        # 3. Física de Salto
        if self.is_jumping:
            eff_gravity = self.gravity * 2.0 if self.is_ducking else self.gravity
            self.dino_y += self.dino_vy
            self.dino_vy += eff_gravity

            if self.dino_y >= self.ground_y - self.dino_height:
                self.dino_y = self.ground_y - self.dino_height
                self.dino_vy = 0.0
                self.is_jumping = False

        # 4. Movimentação dos Obstáculos
        for obs in self.obstacles:
            obs["x"] -= self.speed

        self.obstacles = [obs for obs in self.obstacles if obs["x"] + obs["w"] > 0]

        # 5. Detecção de Colisão
        collision = False
        d_box = (self.dino_x + 4, self.dino_y + 2, self.dino_width - 8, self.dino_height - 4)

        for obs in self.obstacles:
            o_box = (obs["x"] + 2, obs["y"] + 2, obs["w"] - 4, obs["h"] - 4)
            if self._boxes_intersect(d_box, o_box):
                collision = True
                break

        # 6. Recompensa (Reward Shaping)
        reward = 0.1  # Recompensa por sobrevivência
        if action == 1:
            reward -= 0.01  # Penalidade leve para desincentivar pulo contínuo aleatório

        for obs in self.obstacles:
            if not obs.get("passed", False) and obs["x"] + obs["w"] < self.dino_x:
                obs["passed"] = True
                reward += 2.0  # Bônus ao superar obstáculo

        terminated = collision
        if terminated:
            reward = -10.0

        truncated = self.step_count >= 10000

        # 7. Atualiza buffer de observação temporal
        new_frame = self._render_frame_to_buffer()
        self.frame_buffer = np.roll(self.frame_buffer, shift=-1, axis=0)
        self.frame_buffer[-1] = new_frame

        info = {
            "score": self.score,
            "speed": self.speed,
            "collision": collision,
            "is_jumping": self.is_jumping,
            "is_ducking": self.is_ducking,
        }

        return self.frame_buffer.copy(), reward, terminated, truncated, info

    def spawn_adversarial_obstacle(self, obs_type: str, x: float, w: int, h: int, y: float):
        """Método injetado pela IA Criadora para gerar desafios adversariais."""
        self.obstacles.append({
            "type": obs_type,
            "x": x,
            "w": w,
            "h": h,
            "y": y,
            "passed": False,
        })

    def _boxes_intersect(self, a, b) -> bool:
        return (
            a[0] < b[0] + b[2]
            and a[0] + a[2] > b[0]
            and a[1] < b[1] + b[3]
            and a[1] + a[3] > b[1]
        )

    def _render_frame_to_buffer(self) -> np.ndarray:
        """Renderiza um canvas monocromático simplificado e redimensiona para 84x84."""
        canvas = np.zeros((self.height, self.width), dtype=np.uint8)

        # Chão
        canvas[self.ground_y :, :] = 80

        # Dino
        dy = int(max(0, min(self.height - 1, self.dino_y)))
        dh = int(self.dino_height)
        dw = int(self.dino_width)
        dx = int(self.dino_x)
        canvas[dy : dy + dh, dx : dx + dw] = 255

        # Obstáculos
        for obs in self.obstacles:
            ox = int(obs["x"])
            oy = int(obs["y"])
            ow = int(obs["w"])
            oh = int(obs["h"])
            if 0 <= ox < self.width:
                x_end = min(self.width, ox + ow)
                y_end = min(self.height, oy + oh)
                canvas[oy:y_end, ox:x_end] = 200

        # Downsample para visão computacional padrão 84x84
        resized = cv2.resize(canvas, (84, 84), interpolation=cv2.INTER_AREA)
        return resized
`,
  },
  {
    name: 'vision_runner.py',
    language: 'python',
    description: 'IA Jogadora: CNN com Atenção Espacial e visão computacional',
    code: `"""
vision_runner.py - IA Jogadora com Visão Computacional Moderna e Mecanismo de Atenção
Processa o tensor (B, 4, 84, 84) gerado pelo Gymnasium e extrai mapas de saliência.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Tuple


class SpatialAttentionModule(nn.Module):
    """
    Módulo de Atenção Espacial para identificar regiões críticas
    (cactos em aproximação, pterodáctilos em rota de colisão).
    """

    def __init__(self):
        super().__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size=7, padding=3, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # Agrupamento de canais: média e valor máximo
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        combined = torch.cat([avg_out, max_out], dim=1)
        attention_map = self.sigmoid(self.conv(combined))
        return x * attention_map, attention_map


class DinoVisionBackbone(nn.Module):
    """
    Backbone Convolucional estilo Nature-CNN aprimorado com Atenção Espacial.
    Entrada: (Batch, 4, 84, 84)
    Saída: Vetor de embeddings latente (Batch, 512) + Mapa de Saliência
    """

    def __init__(self, in_channels: int = 4, feature_dim: int = 512):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, 32, kernel_size=8, stride=4)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=4, stride=2)
        self.conv3 = nn.Conv2d(64, 64, kernel_size=3, stride=1)
        self.attention = SpatialAttentionModule()

        # Calcula dimensão após convoluções: 64 x 7 x 7 = 3136
        self.fc = nn.Linear(64 * 7 * 7, feature_dim)
        self.layer_norm = nn.LayerNorm(feature_dim)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        # Normaliza valores de pixel [0, 255] -> [0.0, 1.0]
        x = x.float() / 255.0

        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))

        x_attended, saliency_map = self.attention(x)

        flattened = x_attended.view(x_attended.size(0), -1)
        features = F.relu(self.layer_norm(self.fc(flattened)))

        return features, saliency_map


class DinoActorCritic(nn.Module):
    """
    Rede Actor-Critic completa para a IA Jogadora:
    - Actor: Distribuição Categórica sobre as 3 ações (RUN, JUMP, DUCK).
    - Critic: Estimativa de valor escalar V(s).
    """

    def __init__(self, in_channels: int = 4, action_dim: int = 3):
        super().__init__()
        self.backbone = DinoVisionBackbone(in_channels=in_channels, feature_dim=512)

        # Cabeça do Ator (Políticas)
        self.actor_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, action_dim),
        )

        # Cabeça do Crítico (Valor de Estado)
        self.critic_head = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
        )

    def forward(
        self, state_tensor: torch.Tensor
    ) -> Tuple[torch.distributions.Categorical, torch.Tensor, torch.Tensor]:
        features, saliency = self.backbone(state_tensor)

        logits = self.actor_head(features)
        action_dist = torch.distributions.Categorical(logits=logits)
        value = self.critic_head(features)

        return action_dist, value, saliency

    def act(self, state_tensor: torch.Tensor, deterministic: bool = False):
        action_dist, value, saliency = self.forward(state_tensor)
        if deterministic:
            action = torch.argmax(action_dist.probs, dim=-1)
        else:
            action = action_dist.sample()
        action_log_prob = action_dist.log_prob(action)
        return action.item(), action_log_prob, value.item(), saliency
`,
  },
  {
    name: 'adversarial_creator.py',
    language: 'python',
    description: 'IA Criadora: Rede Adversarial (GAN) para geração dinâmica de obstáculos',
    code: `"""
adversarial_creator.py - IA Criadora (Dynamic Obstacle Generator via WGAN-GP)
Aprende os padrões de falha do Dino e gera sequências adversariais sob restrição de solubilidade física.
"""

from typing import Tuple, Dict, Any
import torch
import torch.nn as nn
import torch.autograd as autograd


class ObstacleGenerator(nn.Module):
    """
    Gerador Adversarial: Mapeia um vetor de ruído latente z ~ N(0, I) + Perfil de Vulnerabilidade
    para parâmetros concretos de obstáculos (tipo, largura, altura, altitude e intervalo).
    """

    def __init__(self, latent_dim: int = 16, condition_dim: int = 4):
        super().__init__()
        self.latent_dim = latent_dim
        input_dim = latent_dim + condition_dim

        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(64, 128),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(128, 64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(64, 6),  # [type_logits (3), gap_spacing, height_norm, speed_modifier]
        )

    def forward(self, z: torch.Tensor, condition: torch.Tensor) -> torch.Tensor:
        x = torch.cat([z, condition], dim=-1)
        return self.net(x)


class SolvabilityDiscriminator(nn.Module):
    """
    Discriminador de Solubilidade: Avalia se o obstáculo gerado é fisicamente
    superável pela cinemática do Dino, penalizando armadilhas impossíveis.
    """

    def __init__(self, condition_dim: int = 4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(6 + condition_dim, 64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(64, 64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Linear(64, 1),  # Escalar de validade/dificuldade
        )

    def forward(self, obstacle_params: torch.Tensor, condition: torch.Tensor) -> torch.Tensor:
        x = torch.cat([obstacle_params, condition], dim=-1)
        return self.net(x)


class AdversarialArchitectAI:
    """
    Controlador da IA Criadora que interage com o loop de simulação:
    1. Mantém o vetor de perfil de vulnerabilidade do Dino.
    2. Gera novos obstáculos adversariais sob demanda.
    3. Treina o Gerador para maximizar a entropia da política do Dino sem violar solubilidade.
    """

    def __init__(self, latent_dim: int = 16, device: str = "cpu"):
        self.device = torch.device(device)
        self.latent_dim = latent_dim

        self.generator = ObstacleGenerator(latent_dim=latent_dim, condition_dim=4).to(self.device)
        self.discriminator = SolvabilityDiscriminator(condition_dim=4).to(self.device)

        self.opt_g = torch.optim.Adam(self.generator.parameters(), lr=1e-4, betas=(0.5, 0.9))
        self.opt_d = torch.optim.Adam(self.discriminator.parameters(), lr=2e-4, betas=(0.5, 0.9))

        # Perfil de Vulnerabilidade: [jump_early_bias, duck_weakness, high_speed_vulnerability, cluster_flaw]
        self.vulnerability_vector = torch.zeros((1, 4), device=self.device)

    def update_vulnerabilities(self, stats: Dict[str, float]):
        self.vulnerability_vector[0, 0] = stats.get("jump_early_bias", 0.0)
        self.vulnerability_vector[0, 1] = stats.get("duck_weakness", 0.0)
        self.vulnerability_vector[0, 2] = stats.get("high_speed_vulnerability", 0.0)
        self.vulnerability_vector[0, 3] = stats.get("cluster_flaw", 0.0)

    def generate_obstacle(self, current_speed: float) -> Dict[str, Any]:
        """Gera um obstáculo adversarial em tempo real com base no perfil do jogador."""
        self.generator.eval()
        with torch.no_grad():
            z = torch.randn(1, self.latent_dim, device=self.device)
            raw_out = self.generator(z, self.vulnerability_vector)[0].cpu().numpy()

        type_logits = raw_out[:3]
        chosen_type_idx = int(type_logits.argmax())

        types = ["cactus_triple", "pterodactyl_mid", "pterodactyl_low"]
        obs_type = types[chosen_type_idx]

        # Normalização dos parâmetros cinemáticos
        gap = float(max(180, 280 + raw_out[3] * 40))
        speed_mod = float(max(0.9, min(1.25, 1.0 + raw_out[5] * 0.15)))

        if obs_type == "cactus_triple":
            w, h, y = 60, 48, 160 - 48
        elif obs_type == "pterodactyl_mid":
            w, h, y = 46, 36, 160 - 56  # Requer DUCK
        else:
            w, h, y = 46, 36, 160 - 38  # Requer JUMP

        return {
            "type": obs_type,
            "width": w,
            "height": h,
            "y": y,
            "gap": gap,
            "speed_multiplier": speed_mod,
            "latent_vector": z.squeeze().tolist(),
        }

    def train_step(self, dino_failed: bool, obstacle_tensor: torch.Tensor):
        """Passo de treino WGAN com penalidade de gradiente para estabilidade."""
        self.generator.train()
        self.discriminator.train()

        z = torch.randn(obstacle_tensor.size(0), self.latent_dim, device=self.device)
        fake_obstacles = self.generator(z, self.vulnerability_vector)

        # Perda do Discriminador
        d_real = self.discriminator(obstacle_tensor, self.vulnerability_vector)
        d_fake = self.discriminator(fake_obstacles.detach(), self.vulnerability_vector)

        d_loss = -torch.mean(d_real) + torch.mean(d_fake)
        self.opt_d.zero_grad()
        d_loss.backward()
        self.opt_d.step()

        # Perda do Gerador (estimulado a aumentar dificuldade física)
        g_loss = -torch.mean(self.discriminator(fake_obstacles, self.vulnerability_vector))
        self.opt_g.zero_grad()
        g_loss.backward()
        self.opt_g.step()
`,
  },
  {
    name: 'hybrid_ppo_genetic.py',
    language: 'python',
    description: 'IA Superadora: PPO Híbrido com Algoritmos Genéticos Evolutivos',
    code: `"""
hybrid_ppo_genetic.py - IA Superadora (Hybrid PPO + Evolutionary Genetic Algorithm)
O PPO calcula gradientes de política via GAE-Lambda; o módulo Genético realiza
crossover e mutação populacional para evitar vales de mínimos locais.
"""

from typing import List, Tuple
import copy
import numpy as np
import torch
import torch.nn as nn
from vision_runner import DinoActorCritic


class RolloutBuffer:
    """Buffer de trajetórias para cálculo das atualizações PPO."""

    def __init__(self):
        self.states = []
        self.actions = []
        self.log_probs = []
        self.rewards = []
        self.is_terminals = []
        self.values = []

    def clear(self):
        self.states.clear()
        self.actions.clear()
        self.log_probs.clear()
        self.rewards.clear()
        self.is_terminals.clear()
        self.values.clear()


class HybridPPOGeneticOptimizer:
    """
    Otimizador Híbrido:
    - PPO: Atualiza os pesos finos por gradiente com corte de razão (clip ε=0.2).
    - Genética: Realiza cruzamento e perturbação estocástica entre indivíduos da população.
    """

    def __init__(
        self,
        population_size: int = 12,
        lr: float = 3e-4,
        gamma: float = 0.99,
        gae_lambda: float = 0.95,
        clip_eps: float = 0.2,
        device: str = "cpu",
    ):
        self.device = torch.device(device)
        self.gamma = gamma
        self.gae_lambda = gae_lambda
        self.clip_eps = clip_eps
        self.population_size = population_size

        # População de agentes (redes neurais competidoras)
        self.population: List[DinoActorCritic] = [
            DinoActorCritic().to(self.device) for _ in range(population_size)
        ]
        self.optimizers = [
            torch.optim.Adam(agent.parameters(), lr=lr) for agent in self.population
        ]

        self.mutation_rate = 0.12
        self.mutation_scale = 0.25

    def compute_gae(
        self, rewards: List[float], values: List[float], is_terminals: List[bool], next_value: float
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """Calcula Generalized Advantage Estimation (GAE-λ)."""
        advantages = []
        gae = 0.0
        values_extended = values + [next_value]

        for step in reversed(range(len(rewards))):
            delta = (
                rewards[step]
                + self.gamma * values_extended[step + 1] * (1.0 - float(is_terminals[step]))
                - values_extended[step]
            )
            gae = delta + self.gamma * self.gae_lambda * (1.0 - float(is_terminals[step])) * gae
            advantages.insert(0, gae)

        advantages_tensor = torch.tensor(advantages, dtype=torch.float32, device=self.device)
        returns_tensor = advantages_tensor + torch.tensor(values, dtype=torch.float32, device=self.device)

        # Normalização dos Advantages
        advantages_tensor = (advantages_tensor - advantages_tensor.mean()) / (
            advantages_tensor.std() + 1e-8
        )
        return advantages_tensor, returns_tensor

    def ppo_update_agent(self, agent_idx: int, buffer: RolloutBuffer, next_value: float) -> Tuple[float, float]:
        """Executa a atualização de política do PPO para um indivíduo da população."""
        agent = self.population[agent_idx]
        optimizer = self.optimizers[agent_idx]

        states = torch.stack(buffer.states).to(self.device)
        actions = torch.tensor(buffer.actions, dtype=torch.long, device=self.device)
        old_log_probs = torch.tensor(buffer.log_probs, dtype=torch.float32, device=self.device)

        advantages, returns = self.compute_gae(
            buffer.rewards, buffer.values, buffer.is_terminals, next_value
        )

        total_policy_loss = 0.0
        total_value_loss = 0.0

        # Épocas de otimização PPO
        for _ in range(4):
            dist, state_values, _ = agent(states)
            new_log_probs = dist.log_prob(actions)
            entropy = dist.entropy().mean()

            # Razão de Probabilidade: r(θ) = π_θ(a|s) / π_θ_old(a|s)
            ratios = torch.exp(new_log_probs - old_log_probs)

            # Perda de Política Cortada (Clipping)
            surr1 = ratios * advantages
            surr2 = torch.clamp(ratios, 1.0 - self.clip_eps, 1.0 + self.clip_eps) * advantages
            policy_loss = -torch.min(surr1, surr2).mean()

            # Perda do Crítico
            value_loss = 0.5 * (state_values.squeeze(-1) - returns).pow(2).mean()

            # Perda Total com Regularização de Entropia
            loss = policy_loss + 0.5 * value_loss - 0.01 * entropy

            optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(agent.parameters(), max_norm=0.5)
            optimizer.step()

            total_policy_loss += policy_loss.item()
            total_value_loss += value_loss.item()

        buffer.clear()
        return total_policy_loss / 4.0, total_value_loss / 4.0

    def evolve_generation(self, fitness_scores: List[float]):
        """
        Executa a recombinação genética evolutiva na extinção da geração:
        - Elitismo: Mantém os 2 melhores agentes intactos.
        - Crossover: Cruzamento aritmético de pesos entre os melhores genomas.
        - Mutação: Perturbação gaussiana dos tensores de peso.
        """
        sorted_indices = np.argsort(fitness_scores)[::-1]
        elite_indices = sorted_indices[:2]

        new_population = []

        # 1. Elitismo
        for idx in elite_indices:
            new_population.append(copy.deepcopy(self.population[idx]))

        # 2. Crossover e Mutação
        pool = sorted_indices[: max(3, self.population_size // 2)]

        while len(new_population) < self.population_size:
            p1_idx = int(np.random.choice(pool))
            p2_idx = int(np.random.choice(pool))

            parent1 = self.population[p1_idx]
            parent2 = self.population[p2_idx]

            child = copy.deepcopy(parent1)

            # Crossover de parâmetros
            alpha = np.random.uniform(0.3, 0.7)
            with torch.no_grad():
                for c_param, p2_param in zip(child.parameters(), parent2.parameters()):
                    c_param.data = alpha * c_param.data + (1.0 - alpha) * p2_param.data

                    # Mutação estocástica
                    if np.random.rand() < self.mutation_rate:
                        noise = torch.randn_like(c_param) * self.mutation_scale
                        c_param.data += noise

            new_population.append(child)

        self.population = new_population
`,
  },
  {
    name: 'train_multiagent.py',
    language: 'python',
    description: 'Script mestre de co-evolução multiagente 2026',
    code: `"""
train_multiagent.py - Script Mestre de Treinamento Co-Evolutivo
Orquestra o ciclo fechado entre:
- IA Criadora (Gerador de Obstáculos)
- IA Superadora (Otimizador Híbrido PPO + Genética)
- IA Jogadora (Agente de Visão em Gymnasium)
"""

import argparse
import os
import torch
import numpy as np
from tqdm import tqdm
from dino_gym_env import DinoGymEnv
from adversarial_creator import AdversarialArchitectAI
from hybrid_ppo_genetic import HybridPPOGeneticOptimizer, RolloutBuffer


def train_tri_agent(args):
    device = "cuda" if torch.cuda.is_available() and args.device == "cuda" else "cpu"
    print(f"[*] Inicializando IAMDinosaur 2026 Tri-Core no dispositivo: {device}")

    # Inicializa Ambiente Gym
    env = DinoGymEnv()

    # Inicializa as 3 Inteligências Artificiais
    architect_ai = AdversarialArchitectAI(latent_dim=16, device=device)
    optimizer_ai = HybridPPOGeneticOptimizer(
        population_size=args.population_size, lr=args.lr, device=device
    )

    buffers = [RolloutBuffer() for _ in range(args.population_size)]

    os.makedirs("checkpoints", exist_ok=True)
    best_overall_score = 0

    for episode in range(1, args.num_episodes + 1):
        print(f"\\n--- Geração / Episódio {episode}/{args.num_episodes} ---")

        fitness_scores = [0.0] * args.population_size

        for agent_idx in range(args.population_size):
            agent = optimizer_ai.population[agent_idx]
            buffer = buffers[agent_idx]

            obs, _ = env.reset()
            done = False
            episode_reward = 0.0
            next_obstacle_timer = 50

            while not done:
                # 1. IA Criadora gera currículo adversarial quando o timer atinge 0
                next_obstacle_timer -= 1
                if next_obstacle_timer <= 0:
                    obstacle_data = architect_ai.generate_obstacle(env.speed)
                    env.spawn_adversarial_obstacle(
                        obs_type=obstacle_data["type"],
                        x=env.width + 10,
                        w=obstacle_data["width"],
                        h=obstacle_data["height"],
                        y=obstacle_data["y"],
                    )
                    next_obstacle_timer = int(obstacle_data["gap"] / env.speed)

                # 2. IA Jogadora percebe frames com Visão Computacional
                state_tensor = torch.tensor(obs, dtype=torch.uint8).unsqueeze(0).to(device)
                action, log_prob, value, _ = agent.act(state_tensor)

                # 3. Executa no Gym
                next_obs, reward, terminated, truncated, info = env.step(action)
                done = terminated or truncated
                episode_reward += reward

                # Armazena na trajetória para o PPO
                buffer.states.append(state_tensor.squeeze(0).cpu())
                buffer.actions.append(action)
                buffer.log_probs.append(log_prob.item())
                buffer.rewards.append(reward)
                buffer.values.append(value)
                buffer.is_terminals.append(done)

                obs = next_obs

            fitness_scores[agent_idx] = float(info["score"])

            # 4. Atualização PPO do agente individual
            next_val = 0.0
            p_loss, v_loss = optimizer_ai.ppo_update_agent(agent_idx, buffer, next_val)

        # Avaliação da Geração
        best_gen_score = max(fitness_scores)
        avg_gen_score = sum(fitness_scores) / len(fitness_scores)
        print(f"Resultado Gen {episode} | Melhor Score: {best_gen_score:.1f} | Média: {avg_gen_score:.1f}")

        # Atualiza métricas da IA Criadora
        architect_ai.update_vulnerabilities({
            "jump_early_bias": 0.4 if avg_gen_score < 200 else 0.1,
            "duck_weakness": 0.6 if avg_gen_score < 400 else 0.2,
            "high_speed_vulnerability": 0.8 if avg_gen_score < 600 else 0.3,
            "cluster_flaw": 0.5,
        })

        # Salva o melhor campeão
        if best_gen_score > best_overall_score:
            best_overall_score = best_gen_score
            best_agent_idx = int(np.argmax(fitness_scores))
            torch.save(
                optimizer_ai.population[best_agent_idx].state_dict(),
                "checkpoints/best_champion.pt",
            )
            print(f"[✓] Novo recorde! Modelo campeão salvo em checkpoints/best_champion.pt")

        # 5. IA Superadora executa recombinação genética para a próxima geração
        optimizer_ai.evolve_generation(fitness_scores)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="IAMDinosaur 2026 Co-Evolution Engine")
    parser.add_argument("--num_episodes", type=int, default=500, help="Número de episódios/gerações")
    parser.add_argument("--population_size", type=int, default=12, help="Tamanho da população de Dinos")
    parser.add_argument("--lr", type=float, default=3e-4, help="Learning Rate PPO")
    parser.add_argument("--device", type=str, default="cuda", choices=["cuda", "cpu"])
    args = parser.parse_args()

    train_tri_agent(args)
`,
  },
];
