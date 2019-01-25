---
title: Duel DQN 구현
description: Q값을 분리시키자
created: '2019-01-23T13:08:18.250Z'
modified: '2019-01-25T13:51:27.019Z'
attachments: [DuelDQN.png]
tags: [RL]
---

# Duel DQN 구현

모든 코드는 https://github.com/g6ling/Reinforcement-Learning-Pytorch-Cartpole 에 있습ㄴ다.

## 논문
https://arxiv.org/pdf/1511.06581.pdf

Duel DQN 은 매우 간단한 발상에서 출발합니다.

지금까지의 `Q-value` 을 통해서 최적의 방법을 찾고 있었습니다.

그런데 만약 `Q-value` 을 분해 할 수 있다면 어떨까? 라는 발상입니다.

즉 $Q(s,a) = V(s) + A(s,a)$ 라는 방법이지요. 이러한 방법을 통해서 각각의 액션이 상대적으로 얼마나 좋은지를 예측할 수 있습니다.
즉 정확한 `Q-value`을 몰라도 `A`을 통해서 상대적으로 더 좋은 액션을 선택할 수 있다는 것이지요.

이걸 위해서 마지막의 Layer 에서 각각 Layer 을 추가하여서 V, A 값을 얻습니다.

![](../attachments/duelDQN.png)

논문에서는 $Q(s,a) = V(s) + A(s,a)$ 을 그대로 사용하지 않습니다. 이유로는 이럴경우 Q 값을 알때 V와 A가 각각 분리될 수 없기 때문에 (정확히는 Q 값이 주어졌을때 V, A 값을 각각 unique하지 않기 때문에) 성능이 좋지 않다고 합니다.
그래서 변형식인 
$$ Q(s,a) = V(s) + (A(s,a) - max_aA(s,a))$$
을 사용한다고 합니다. 이럴경우 항상 최선의 방법을 선택한다면 하나의 Q값에 대해서 첫항과 두번째 항이 분리가 됩니다. (2번째 항이 0이 되기 때문에 V는 Q 로 뒤의 항은 0 으로 분리 됩니다)

하지만 논문에서는 max 대신 mean 을 사용하여서 식을 다시 변형합니다.
$$ Q(s,a) = V(s) + (A(s,a) - \frac {1} {|A|} \sum A(s,a))$$
max 을 사용하는 것 보다 mean 을 사용하는 것이 좀더 수렴이 빠르게 된다고 합니다. 간단하게 생각하면 (max-min) 보다는 (max-mean), (mean-min) 의 값이 더 적을 것이고, 그 만큼 업데이트를 조금만 해주어도 된다고 말합니다. (하지만 다시 원래의 분리가 안된다는 문제에 돌아왔지만 약간의 Trade-off의 성격으로 이 방법을 사용하는 것 같습니다)

## 구현

```python
class DuelDQNet(nn.Module):
    def __init__(self, num_inputs, num_outputs):
        super(DuelDQNet, self).__init__()
        self.num_inputs = num_inputs
        self.num_outputs = num_outputs

        # V, A 값을 각각 알기 위해서 각각 따로 계산합니다.
        self.fc = nn.Linear(num_inputs, 128)
        self.fc_adv = nn.Linear(128, num_outputs)
        self.fc_val = nn.Linear(128, 1)

        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform(m.weight)

    def forward(self, x):
        x = F.relu(self.fc(x))
        adv = self.fc_adv(x)
        adv = adv.view(-1, self.num_outputs)
        val = self.fc_val(x)
        val = val.view(-1, 1)

        # Q = V + (A - A.mean)
        qvalue = val + (adv - adv.mean(dim=1, keepdim=True))
        return qvalue

  
```

나머지 부분은 DQN 과 동일합니다.
