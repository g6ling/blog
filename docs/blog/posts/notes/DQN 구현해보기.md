---
title: DQN 구현해보기
description: 제일 기본적인 DQN
created: '2019-01-22T12:48:39.297Z'
modified: '2019-01-25T14:18:56.779Z'
tags: [Rainbow, RL]
---

# DQN 구현해보기

모든 코드는 <https://github.com/g6ling/Reinforcement-Learning-Pytorch-Cartpole> 에 있습니다.
## 논문
<https://arxiv.org/abs/1312.5602>

워낙 유명한 논문입니다. 사실 강화학습이나 DQN 에 대한 글은 많이 있으니 여기 포스트에서는 길게 설명하지 않겠습니다.

뒤에 이어지는 포스트들을 위해서도 논문을 한번 쭈욱 훑어 보시는걸 추천드립니다.

이 논문에서는 `experience replay memory` 와 `target-network` 을 통해서 성능 향상을 이룬 부분이 가장 큽니다.


### experience replay memory
`experience replay memory` 같은 경우는 한번 경험한 내용을 한번만 학습하고 버리는 대신에 `memory` 에 저장해 놓고 나중에 학습할 때도 계속 꺼내쓰는 방법입니다. 그렇기 때문에 항상 전체의 경험에 대한 최적의 방법으로 학습이 되는거죠. 그렇지 않다면 항상 그때 그때의 최적의 방법으로 학습이 될 것 입니다.

### target network
`target network` 는 기존의 network는 학습이 되어감과 동시에 자기자신이 바뀐다는 문제가 있습니다. 
$$loss = (Q(s_t,a_t) - (r + \gamma max_aQ(s_{t+1}, a)))^2$$
위의 방법을 보면 Q 을 업뎃하기 위해서 Q을 값과 비교하는데 이렇게 된다면 비교대상도 동시에 다시 업데이트 되는 문제가 발생합니다.

그래서 `target-network` 라는 기존의 네트워크와 동일한 네트워크를 하나 만든뒤 그 network 을 일정주기마다 복사하는 방법을 사용합니다. 이러한 방법을 통해서 비교대상을 고정시키는 효과를 노립니다.

```python
import os
import sys
import gym
import random
import numpy as np

import torch
import torch.optim as optim
import torch.nn.functional as F
from model import QNet
from memory import Memory
from tensorboardX import SummaryWriter

from config import env_name, initial_exploration, batch_size, update_target, goal_score, log_interval, device, replay_memory_capacity, lr


# 액션을 선택할 때 일정 확률로 랜덤한 액션을 선택합니다.
def get_action(state, target_net, epsilon, env):
    if np.random.rand() <= epsilon:
        return env.action_space.sample()
    else:
        return target_net.get_action(state)

# 일정주기마다 online network 을 target net 에 복사시킵니다. target net 의 업데이트는 자주 일어나지 않기 때문에 target network 가 고정된 것과 같은 효과를 가질 수 있습니다.
def update_target_model(online_net, target_net):
    # Target <- Net
    target_net.load_state_dict(online_net.state_dict())


def main():
    env = gym.make(env_name)
    # seed 란 랜덤변수를 초기화 하는 역할을 합니다. 
    # 딱히 안하셔도 상관이 없지만 이걸 할 경우 각각의 실행에 대해서 같은 랜덤값을 가질 수 있습니다.
    # 보다 자세한건 검색을 해주세요  키워드 : numpy seed 
    env.seed(500)
    torch.manual_seed(500)

    num_inputs = env.observation_space.shape[0]
    num_actions = env.action_space.n
    print('state size:', num_inputs)
    print('action size:', num_actions)

    # 같은 네트워크를 만들고 일단 바로 복사시켜줍니다.
    online_net = QNet(num_inputs, num_actions)
    target_net = QNet(num_inputs, num_actions)
    update_target_model(online_net, target_net)

    optimizer = optim.Adam(online_net.parameters(), lr=lr)
    writer = SummaryWriter('logs')

    # to 는 cpu, gpu 사용을 위한 것 입니다. gpu 을 사용할 수 있는 환경이라면 gpu 을 사용합니다.
    online_net.to(device)
    target_net.to(device)
    # train 은 network 을 바꿀수 있게 해줍니다.
    # 반대로 eval() 을 할 경우 network 을 업데이트 되지 
    online_net.train()
    target_net.train()
    memory = Memory(replay_memory_capacity)
    running_score = 0
    epsilon = 1.0
    steps = 0
    loss = 0

    for e in range(3000):
        done = False

        score = 0
        state = env.reset()
        state = torch.Tensor(state).to(device)
        state = state.unsqueeze(0)

        while not done:
            steps += 1

            action = get_action(state, target_net, epsilon, env)
            next_state, reward, done, _ = env.step(action)

            next_state = torch.Tensor(next_state)
            next_state = next_state.unsqueeze(0)

            mask = 0 if done else 1
            reward = reward if not done or score == 499 else -1
            action_one_hot = np.zeros(2)
            action_one_hot[action] = 1
            memory.push(state, next_state, action_one_hot, reward, mask)

            score += reward
            state = next_state

            if steps > initial_exploration:
                # epsilon 값을 줄여가면서 탐험을 점점 줄여나갑니다.
                epsilon -= 0.00005
                epsilon = max(epsilon, 0.1)

                # memory 에서 적당한 숫자만큼 샘플을 뽑고 그걸로 학습을 시킵니다. 이렇게 함으로써 전체 에피소드에 대한 최적해를 찾아갑니다.
                batch = memory.sample(batch_size)
                loss = QNet.train_model(online_net, target_net, optimizer, batch)
                # 일정주기 마다 target network 을 복사시켜줍니다.
                if steps % update_target == 0:
                    update_target_model(online_net, target_net)

        score = score if score == 500.0 else score + 1
        running_score = 0.99 * running_score + 0.01 * score
        if e % log_interval == 0:
            print('{} episode | score: {:.2f} | epsilon: {:.2f}'.format(
                e, running_score, epsilon))
            writer.add_scalar('log/score', float(running_score), e)
            writer.add_scalar('log/loss', float(loss), e)

        if running_score > goal_score:
            break


if __name__=="__main__":
    main()
```
