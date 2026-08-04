---
title: "Path Planning for Multipoint Seabed Survey Mission Using Autonomous Underwater Vehicle"
collection: publications
category: conferences
permalink: /publication/2017-auv-path-planning
excerpt: '面向大尺度离散多目标海底复测，本文提出两阶段贪心框架：迭代 K-means 布置支撑船锚点，再以蚁群算法规划各锚点邻域航迹，在续航约束下降低多点测量总代价。<br /><br />For large-scale multipoint seabed resurveys, this paper proposes a two-stage greedy planner: iterative K-means places support-vessel anchor points, then an ant-colony procedure orders visits from each anchor, reducing total mission cost under AUV endurance limits.'
date: 2017-06-01
venue: 'IEEE OCEANS'
paperurl: '/files/IEEE-OCEANS-2017-1.pdf'
citation: '<b>Yang An</b>, Gaofei Xu, Chunhui Xu, Hongyu Zhao, and Jian Liu<sup>*</sup>. (2017). &quot;Path Planning for Multipoint Seabed Survey Mission Using Autonomous Underwater Vehicle.&quot; <i>IEEE OCEANS Conference</i>.'
---
地质学家在首轮调查后常圈定需复测或取样的离散目标点，这些点可能散布于大尺度海域。AUV 续航提升使单次下潜覆盖多点成为可能，多艇协同亦提高效率，因而需要航次级全局路径规划。既有工作多关注单点附近覆盖或含流/障碍的点到点路径，对大尺度多点任务讨论不足；校车路径等经典分派框架亦因目标必须精确到达而难以直接套用。

本文用贪心策略将问题拆为两步：先迭代执行 K-means 求支撑船锚点布局，再以蚁群（ant-cycle）系统优化各锚点至邻近目标的访问顺序。仿真验证了算法有效性，尤其适用于资源受限的水下多点测量与多 AUV 部署场景。

After an initial survey, marine geologists often designate discrete points needing closer observation or sampling, potentially scattered over large areas. Growing AUV endurance enables multipoint surveys in a single dive, and multi-AUV fleets further raise efficiency—motivating voyage-level path planning. Prior work largely addresses local coverage or point-to-point routing through currents/obstacles; school-bus-style assignment frameworks do not map cleanly onto exact visits to every target.

This paper decomposes the problem greedily into two steps: iterative K-means locates support-vessel anchor points, then an ant-cycle system optimises visit order from each anchor to nearby targets. Simulations demonstrate validity, supporting resource-constrained multipoint seabed surveys and multi-AUV deployments.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1109/OCEANSE.2017.8084941)</small>
