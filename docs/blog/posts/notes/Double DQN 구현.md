---
title: Double DQN 구현
description: Action 선택은 Online Network가
created: '2019-01-22T13:29:49.009Z'
modified: '2019-01-25T14:18:46.919Z'
tags: [Rainbow, RL]
---

# Double DQN 구현

모든 코드는 <https://github.com/g6ling/Reinforcement-Learning-Pytorch-Cartpole> 에 있습니다.

## 논문
<https://arxiv.org/pdf/1509.06461.pdf>

내용은 간단합니다. 
DQN 식에서

$$loss = (Q(s_t,a_t) - (r + \gamma max_aQ(s_{t+1}, a)))^2$$

Double DQN 식으로 

$$loss = (Q(s,a) - (r + \gamma Q'(s, argma_{a'}Q(s,a'))))^2$$

바꿉니다.
단순하게 전에는 target_network 에서 Q 값을 고르고 action 도 target_network 에서 선택을 했다면 이제는 action의 선택을 online_network 에서 하는것 입니다.
그 전에는 한번 target_network 가 어떠한 action에 대해 Q 값을 저평가를 해버리면 되돌리기가 매우 힘들었습니다. 그렇다면 그 q 값이 낮기 때문에 action 이 선택될 확률은 매우 낮을 것이고, 그 action에 대한 Q 값은 그대로 고정이 되기 때문이죠.
그렇기 때문에 action 의 선택을 online_network에 맞김으로서, target_network에서 가진 값과는 좀 더 자유로운 action 선택을 할 수 있게 해줍니다. 

## 구현

```python
@classmethod
    def train_model(cls, online_net, target_net, optimizer, batch):
        states = torch.stack(batch.state)
        next_states = torch.stack(batch.next_state)
        actions = torch.Tensor(batch.action).float()
        rewards = torch.Tensor(batch.reward)
        masks = torch.Tensor(batch.mask)

        pred = online_net(states).squeeze(1)
        _, action_from_online_net = online_net(next_states).squeeze(1).max(1)
        next_pred = target_net(next_states).squeeze(1)

        pred = torch.sum(pred.mul(actions), dim=1)

        ## DQN과 이부분만 다릅니다. action 을 online network 에서 선택합니다.
        target = rewards + masks * gamma * next_pred.gather(1, action_from_online_net.unsqueeze(1)).squeeze(1)


        loss = F.mse_loss(pred, target.detach())
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        return loss
```
