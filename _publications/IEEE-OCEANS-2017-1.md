---
title: "Path Planning for Multipoint Seabed Survey Mission Using Autonomous Underwater Vehicle"
collection: publications
category: conferences
permalink: /publication/2017-auv-path-planning
excerpt: '针对大尺度海域内离散多目标点的海底复测任务，本文提出两阶段贪心路径规划方法：首先通过迭代 K-means 聚类确定支撑船锚点位置，继而采用蚁群算法规划各锚点邻域内的访问顺序，以在续航约束下降低多点测量的总体代价。<br /><br />For multipoint seabed resurvey missions with discrete targets distributed over large sea areas, this paper proposes a two-stage greedy path-planning method. Iterative K-means clustering first determines the locations of support-vessel anchor points; an ant colony algorithm then optimises the visit order within the neighbourhood of each anchor, thereby reducing the overall survey cost under endurance constraints.'
date: 2017-06-01
venue: 'IEEE OCEANS'
paperurl: '/files/IEEE-OCEANS-2017-1.pdf'
citation: '<b>Yang An</b>, Gaofei Xu, Chunhui Xu, Hongyu Zhao, and Jian Liu<sup>*</sup>. (2017). &quot;Path Planning for Multipoint Seabed Survey Mission Using Autonomous Underwater Vehicle.&quot; <i>IEEE OCEANS Conference</i>.'
---
在首轮调查之后，海洋地质学家通常会圈定需要进一步观测或取样的离散目标点，这些点可能分布于大尺度海域。随着自主水下航行器（AUV）续航能力的提升，单次下潜完成多点作业成为可能；多艇协同亦可进一步提高效率，因而需要航次尺度上的全局路径规划。既有研究多关注单点附近的区域覆盖，或含海流与障碍条件下的点到点路径，对大尺度多点任务讨论相对不足；校车路径等问题中的经典分派框架亦因要求精确到达每一目标点而难以直接套用。

本文采用贪心策略将问题分解为两个阶段：首先通过迭代 K-means 聚类确定支撑船锚点布局，随后以蚁群（ant-cycle）系统优化各锚点至邻近目标点的访问顺序。仿真结果验证了算法的有效性，表明该方法适用于资源受限条件下的水下多点测量及多 AUV 部署场景。

Following an initial survey, marine geologists typically designate discrete targets requiring further observation or sampling; such points may be distributed over large sea areas. Advances in the endurance of autonomous underwater vehicles (AUVs) make it feasible to survey multiple targets in a single dive, and multi-AUV cooperation can further improve efficiency, thereby motivating voyage-level global path planning. Prior studies have largely addressed local coverage around individual targets or point-to-point routing in the presence of currents and obstacles, while large-scale multipoint missions remain comparatively underexplored. Classical assignment frameworks from problems such as school bus routing are likewise difficult to apply directly, because every target must be visited exactly.

This paper decomposes the problem into two stages by a greedy strategy. Iterative K-means clustering first determines the layout of support-vessel anchor points; an ant-cycle system then optimises the visit order from each anchor to neighbouring targets. Simulation results confirm the effectiveness of the algorithm and indicate its suitability for resource-constrained multipoint seabed surveys and multi-AUV deployments.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1109/OCEANSE.2017.8084941)</small>
