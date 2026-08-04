---
title: "A coordinate coverage water area monitoring scheme for multiple unmanned surface vehicles in dynamic environments"
collection: publications
category: conferences
permalink: /publication/2025-multi-usv-monitoring
excerpt: '面向动态扩展的水污染区域监测，本文提出多无人水面艇（USV）分布式协同覆盖方案：艇间实时共享覆盖地图与状态，在运动学约束下优化期望速度与航向，利用相互疏离抑制碰撞与冗余覆盖。<br /><br />For monitoring dynamically expanding pollution zones, this paper presents a distributed multi-USV coverage scheme that shares maps and states in real time, optimizes desired velocity and heading under kinematic constraints, and exploits mutual separation to reduce collisions and redundant coverage.'
date: 2025-01-01
venue: 'IEEE International Conference on Unmanned Systems (ICUS)'
paperurl: '/files/IEEE-ICUS-2025-1.pdf'
citation: 'M. Zhang, Z. Ren<sup>*</sup>, Y. He, D. Li, L. Yang, and <b>Yang An</b>. (2025). &quot;A Coordinate Coverage Water Area Monitoring Scheme for Multiple Unmanned Surface Vehicles in Dynamic Environments.&quot; <i>2025 IEEE International Conference on Unmanned Systems (ICUS)</i>.'
---
水体污染范围随污染物特性与水文条件持续变化，传统静态覆盖规划难以跟上污染扩散与 USV 自身运动。多 USV 协同监测可提高安全性与时效，但需要实时共享态势并生成满足运动学约束的可行轨迹。

本文方案使编队实时交换地图与状态，区分已覆盖与未覆盖区域，据此计算各艇期望速度与航向；同时利用 USV 自然疏离倾向降低碰撞风险与重复覆盖。路径规划显式纳入运动学约束，保证轨迹可执行。多种动态环境仿真验证了覆盖能力与效率：随 USV 数量增加，监测完成时间最多可降低约 41%，覆盖率维持在 90% 以上，为快速演化污染场景下的自主环境监测提供可行框架。

Water-pollution footprints evolve with pollutant properties and hydrology, so classical static coverage planners struggle as maps change and USVs move. Multi-USV fleets improve safety and efficiency, but require shared situational awareness and kinematically feasible trajectories.

The proposed scheme enables real-time exchange of maps and vehicle states, distinguishing covered from uncovered regions and computing desired velocity and heading for each USV. Mutual separation reduces collisions and redundant coverage, while kinematic constraints keep planned paths executable. Simulations under diverse dynamic conditions confirm coverage capability and efficiency: deploying more USVs cuts monitoring time by up to about 41% while keeping coverage above 90%, supporting autonomous environmental monitoring of rapidly evolving pollution events.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1109/ICUS66297.2025.11295601)</small>
