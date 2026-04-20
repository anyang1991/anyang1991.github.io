---
title: "Path Planning for Multipoint Seabed Survey Mission Using Autonomous Underwater Vehicle"
collection: publications
category: conferences
permalink: /publication/2017-auv-path-planning
excerpt: '本文提出一种两阶段新框架，将迭代 K-means 聚类与蚁群优化相结合，面向续航受限 AUV 的大尺度海底测量任务求解能耗最优路径规划问题，并通过系统仿真验证其有效性。<br />This paper proposes a novel two-stage framework combining iterative K-means clustering and ant colony optimization to solve energy-optimal path planning for large-scale seabed survey missions using endurance-constrained AUVs, validated through comprehensive simulations.'
date: 2017-06-01
venue: 'IEEE OCEANS'
paperurl: '/files/IEEE-OCEANS-2017-1.pdf'
citation: '<b>Yang An</b>, Gaofei Xu, Chunhui Xu, Hongyu Zhao, and Jian Liu<sup>*</sup>. (2017). &quot;Path Planning for Multipoint Seabed Survey Mission Using Autonomous Underwater Vehicle.&quot; <i>IEEE OCEANS Conference</i>.'
---

面向大尺度海底测量任务中 AUV 续航受限的关键挑战，本文提出一种分层式多点任务路径规划方法。首先，采用带动态剪枝的迭代 K-means 聚类，在满足作业约束与覆盖需求的前提下，优化支撑船锚点/驻留点的空间布局；随后，基于改进蚁群算法对每个锚点出发的测量航迹进行优化，并显式考虑潜航时长、采样容量与航行效率等关键约束。在 160×160 海里、100 个目标点的仿真中，所提方法在满足任务限制的同时显著降低总能耗，尤其适用于资源受限的水下测量以及多 AUV 协同部署场景。

Addressing the challenge of limited AUV endurance in large-scale seabed surveys, this work develops a hierarchical path planning methodology for multi-point missions. The approach first employs iterative K-means clustering with dynamic pruning to strategically position support vessel anchor points while ensuring target coverage under operational constraints. Subsequently, it applies a modified ant colony algorithm to optimize survey paths from each anchor point, incorporating critical constraints including dive duration, sampling capacity, and travel efficiency. Simulation results across a 160×160 nautical mile area with 100 target points demonstrate the framework’s effectiveness in minimizing total energy consumption while satisfying operational limitations. The solution provides significant efficiency gains for resource-constrained underwater survey operations, particularly in multi-AUV deployments.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1109/OCEANSE.2017.8084941)</small>
