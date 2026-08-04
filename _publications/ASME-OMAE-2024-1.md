---
title: "Relative Motion Prediction for Integrated Floating Offshore Wind Turbine Installation Scheme Based on Data-Driven"
collection: publications
category: conferences
permalink: /publication/2024-wind-turbine-prediction
excerpt: '针对浮式海上风电机组“双体船运载预组装件并实施海上对接”的一体化安装方案，本文建立反向传播神经网络模型，依据相对运动的统计特征预测对接点极值相对位移与速度，为对接作业风险预警与现场决策提供数据驱动依据。<br /><br />For an integrated floating offshore wind turbine (FOWT) installation scheme in which a catamaran transports onshore preassemblies for offshore mating, this paper develops a backpropagation neural network that predicts extreme relative displacements and velocities at the mating points from statistical motion features, thereby supporting hazard warning and operational decision-making.'
date: 2024-06-01
venue: 'International Conference on Ocean, Offshore and Arctic Engineering (OMAE)'
paperurl: '/files/ASME-OMAE-2024-1.pdf'
citation: 'Can Ma, Taiyu Zhang, Zongyuan Yang, <b>Yang An</b>, Xiang Yuan Zheng, and Zhengru Ren<sup>*</sup>. (2024). &quot;Relative Motion Prediction for Integrated Floating Offshore Wind Turbine Installation Scheme Based on Data-Driven.&quot; <i>ASME 2024 OMAE</i>.'
---
随着海上风电向更深水域拓展，浮式海上风电机组（FOWT）的安装工艺面临新的挑战。本文研究一种概念性一体化方案：由专用双体船将岸上完成的塔筒–轮毂–叶片预组装件运至场址，并与浮式基础实施对接，以期缩短运输时间与海上吊装作业时长。在不规则海况作用下，预组装件与基础对接点之间将产生复杂相对运动；相对距离过大将提高对接过程中的越界风险。

研究在多种海况条件下利用 Sima 对安装过程进行数值仿真并构建数据集，以既往时段相对运动的均值与低阶中心矩为输入，训练反向传播神经网络，用以预测后续时段对接点最大与最小相对位移及速度。结果表明，该模型可达到可接受的预测精度（决定系数 \(R^2\) 最高约为 0.95，均方误差较低），能够为该安装方案的对接作业提供潜在风险的早期指示，并辅助现场决策。

As offshore wind developments advance into deeper waters, the installation of floating offshore wind turbines (FOWTs) poses new operational challenges. This paper investigates a conceptual integrated scheme in which a purpose-built catamaran transports tower–hub–blade preassemblies completed onshore to the installation site for mating with the floating foundation, with the aim of reducing transport duration and offshore lifting time. Under irregular seas, complex relative motions arise between the mating points of the preassembly and the foundation; excessive relative separation increases the risk of outcrossing during the mating operation.

Installation processes are simulated across a range of sea states in Sima to construct a dataset. Mean values and low-order central moments of relative motion over a preceding interval are used as inputs to a backpropagation neural network that predicts the subsequent maximum and minimum relative displacements and velocities at the mating points. The results indicate acceptable predictive accuracy, with the coefficient of determination \(R^2\) reaching approximately 0.95 and comparatively low mean squared error, thereby enabling early indication of potential hazards and informing crew decision-making for the proposed installation concept.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1115/OMAE2024-124558)</small>
