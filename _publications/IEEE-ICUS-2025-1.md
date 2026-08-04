---
title: "A coordinate coverage water area monitoring scheme for multiple unmanned surface vehicles in dynamic environments"
collection: publications
category: conferences
permalink: /publication/2025-multi-usv-monitoring
excerpt: '针对动态扩展水污染区域的监测需求，本文提出一种多无人水面艇（USV）分布式协同覆盖方法。各艇实时共享覆盖地图与状态信息，在运动学约束下优化期望速度与航向，并利用相互疏离机制降低碰撞风险与冗余覆盖。<br /><br />To address the monitoring of dynamically expanding water-pollution regions, this paper proposes a distributed coordinated coverage scheme for multiple unmanned surface vehicles (USVs). The vehicles exchange coverage maps and state information in real time, optimise desired velocity and heading under kinematic constraints, and employ mutual separation to reduce collision risk and redundant coverage.'
date: 2025-01-01
venue: 'IEEE International Conference on Unmanned Systems (ICUS)'
paperurl: '/files/IEEE-ICUS-2025-1.pdf'
citation: 'M. Zhang, Z. Ren<sup>*</sup>, Y. He, D. Li, L. Yang, and <b>Yang An</b>. (2025). &quot;A Coordinate Coverage Water Area Monitoring Scheme for Multiple Unmanned Surface Vehicles in Dynamic Environments.&quot; <i>2025 IEEE International Conference on Unmanned Systems (ICUS)</i>.'
---
水体污染范围随污染物特性与水文条件持续变化，传统基于静态地图的覆盖规划难以适应污染扩散过程及 USV 自身运动。采用多 USV 协同监测有助于提高作业安全性与时效性，但其有效实施依赖于态势信息的实时共享，以及满足运动学约束的可行轨迹生成。

本文所提方法使编队成员实时交换地图与状态，区分已覆盖与未覆盖区域，并据此计算各艇的期望速度与航向；同时利用 USV 相互疏离的趋势抑制碰撞与重复覆盖。路径规划显式计入运动学约束，以保证轨迹的可执行性。多种动态环境条件下的仿真结果表明，该方法具有较好的覆盖能力与效率：随着 USV 数量增加，监测完成时间最多可缩短约 41%，覆盖率维持在 90% 以上，可为快速演化污染场景下的自主环境监测提供技术支撑。

The spatial extent of water pollution evolves with pollutant characteristics and hydrological conditions, rendering conventional coverage planners based on static maps inadequate for tracking dispersion processes and vehicle motion. Multi-USV cooperative monitoring can improve operational safety and efficiency, yet its effectiveness depends on real-time sharing of situational information and on the generation of trajectories that satisfy kinematic constraints.

The proposed method enables fleet members to exchange maps and states in real time, distinguish covered from uncovered regions, and compute the desired velocity and heading of each vehicle accordingly. Mutual separation among USVs is exploited to mitigate collisions and redundant coverage, while kinematic constraints are incorporated explicitly to ensure trajectory feasibility. Simulations under diverse dynamic conditions indicate favourable coverage capability and efficiency: increasing the number of USVs reduces monitoring completion time by up to approximately 41%, while coverage remains above 90%. The framework thus provides technical support for autonomous environmental monitoring of rapidly evolving pollution events.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1109/ICUS66297.2025.11295601)</small>
