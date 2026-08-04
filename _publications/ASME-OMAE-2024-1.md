---
title: "Relative Motion Prediction for Integrated Floating Offshore Wind Turbine Installation Scheme Based on Data-Driven"
collection: publications
category: conferences
permalink: /publication/2024-wind-turbine-prediction
excerpt: '面向浮式风机“双体船运载预组装件–海上对接”方案，本文用反向传播神经网络，以相对运动统计特征预测对接点极值相对位移/速度，为对接窗口预警与船员决策提供数据驱动支持。<br /><br />For a catamaran-based FOWT installation scheme that mates onshore preassemblies offshore, this study uses a backpropagation neural network with statistical motion features to predict extreme relative displacements/velocities at mating points, supporting hazard warning and crew decisions.'
date: 2024-06-01
venue: 'International Conference on Ocean, Offshore and Arctic Engineering (OMAE)'
paperurl: '/files/ASME-OMAE-2024-1.pdf'
citation: 'Can Ma, Taiyu Zhang, Zongyuan Yang, <b>Yang An</b>, Xiang Yuan Zheng, and Zhengru Ren<sup>*</sup>. (2024). &quot;Relative Motion Prediction for Integrated Floating Offshore Wind Turbine Installation Scheme Based on Data-Driven.&quot; <i>ASME 2024 OMAE</i>.'
---
深水浮式海上风电催生新安装工艺。本文关注一种概念方案：专用双体船将岸上完成的塔筒–轮毂–叶片预组装件运至场址，与浮式基础对接，从而缩短运输与海上吊装时间。不规则海况下，预组装件与基础对接点之间的相对运动难以直观把握，过大相对距离会抬高对接越界风险。

研究在多种海况下用 Sima 仿真安装过程，构建数据集；以过去时段相对运动的均值与低阶中心矩为输入，训练反向传播神经网络，预测未来时段对接点最大/最小相对位移与速度。结果表明模型可达可接受精度（\(R^2\) 最高约 0.95，MSE 较低），能为该一体化安装方案的对接作业提供潜在风险早期预警，辅助船员决策。

Deeper-water floating offshore wind turbines (FOWTs) demand new installation methods. This paper studies a conceptual scheme in which a purpose-built catamaran carries onshore-mated tower–hub–blade preassemblies to site for mating with the floating foundation, shortening transport and offshore crane time. Irregular seas induce hard-to-predict relative motions between mating points; large separations raise outcrossing risk during mating.

Installations are simulated across sea states in Sima to build datasets. Mean values and low-order central moments of recent relative motion feed a backpropagation neural network that forecasts upcoming extrema of relative displacement and velocity. Results show acceptable accuracy (R² up to about 0.95 with low MSE), enabling early hazard indication and informed crew decisions for this integrated installation concept.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1115/OMAE2024-124558)</small>
