---
title: "High-fidelity process plant modeling of an unmanned sailboat with a wing sail based on multi-body dynamics"
collection: publications
category: conferences
permalink: /publication/2025-high-fidelity-modeling
excerpt: '本文给出面向翼帆无人帆船的高保真 MATLAB/Simulink 过程对象模型：6 自由度多体动力学融合 WAMIT 频域水动力与基于 CFD 系数图的 Morison/面元载荷建模，经静力标定与波浪响应验证，支持设计优化与控制算法高保真仿真。<br /><br />This paper presents a high-fidelity MATLAB/Simulink process plant model for wing-sailed unmanned sailboats: a 6-DoF multi-body framework coupling WAMIT hydrodynamics with Morison/panel loads from CFD coefficient maps, validated by static tests and wave-response analysis for design and controller evaluation.'
date: 2025-05-01
venue: 'IFAC Conference on Control Applications in Marine Systems, Robotics, and Vehicles'
paperurl: '/files/IFAC-CAMS-2025-1.pdf'
citation: 'B. Peng, <b>Y. An</b>, M. Zhang, and Z. Ren<sup>*</sup>. (2025). &quot;High-fidelity process plant modeling of an unmanned sailboat with a wing sail based on multi-body dynamics.&quot; <i>IFAC-PapersOnLine</i>.'
---
无人帆船动力学高度非线性，翼帆、舵、龙骨与船体在风浪流激励下强耦合。面向实时控制的控制对象模型往往线性化或解耦，难以刻画分离流、船体振荡与跨子系统耦合；而用于设计验证与数字孪生的高保真过程对象模型在无人帆船领域仍相对缺乏。

本文构建据作者所知首个面向翼帆无人帆船的 MATLAB/Simulink 高保真过程对象模型。6 自由度多体框架纳入帆–舵–龙骨–船体耦合；船体波浪响应由 WAMIT 频域势流系数驱动；翼面、舵与龙骨载荷统一用 Morison 方程描述，升阻力取自预计算 CFD 系数图，并通过离散面元分配分布力。模块化实现支持刚体动力学与环境力双向耦合。静力试验与波浪激励下的动态响应分析验证了物理一致性，为极端海况下的设计优化、控制器验证与故障场景测试提供可复用仿真基座。

Unmanned sailboat dynamics are strongly nonlinear: wing sail, rudder, keel, and hull interact under wind, waves, and currents. Control plant models for onboard use are typically simplified or decoupled and miss separation, hull oscillation, and cross-coupling, while high-fidelity process plant models—valuable for design validation and digital twins—remain underexplored for sailboats.

This work presents, to the authors’ knowledge, the first MATLAB/Simulink high-fidelity process plant model for a wing-sailed unmanned sailboat. A 6-DoF multi-body formulation captures sail–rudder–keel–hull coupling; hull wave loads use WAMIT frequency-domain hydrodynamics; foil forces follow a Morison formulation with CFD-derived lift/drag maps and panel-based distributed loading. Modular subsystems enable bidirectional coupling between rigid-body dynamics and environmental forces. Static force characterization and wave-induced response analysis confirm physical consistency, supporting design optimization, controller validation, and failure-scenario testing under realistic marine conditions.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1016/j.ifacol.2025.11.687)</small>
