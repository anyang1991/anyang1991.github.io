---
title: "High-fidelity process plant modeling of an unmanned sailboat with a wing sail based on multi-body dynamics"
collection: publications
category: conferences
permalink: /publication/2025-high-fidelity-modeling
excerpt: '本文提出面向翼帆无人帆船的高保真 MATLAB/Simulink 过程对象模型。该模型在六自由度多体动力学框架下，融合 WAMIT 频域水动力系数与基于 CFD 系数图的 Morison 方程及面元分布载荷描述，并通过静力标定与波浪响应分析加以验证，可用于设计优化与控制算法评估。<br /><br />This paper presents a high-fidelity MATLAB/Simulink process plant model for wing-sailed unmanned sailboats. Within a six-degree-of-freedom multi-body dynamics framework, the model integrates WAMIT frequency-domain hydrodynamic coefficients with Morison-equation and panel-based distributed loads derived from CFD coefficient maps, and is validated through static force characterisation and wave-response analysis for design optimisation and controller assessment.'
date: 2025-05-01
venue: 'IFAC Conference on Control Applications in Marine Systems, Robotics, and Vehicles'
paperurl: '/files/IFAC-CAMS-2025-1.pdf'
citation: 'B. Peng, <b>Y. An</b>, M. Zhang, and Z. Ren<sup>*</sup>. (2025). &quot;High-fidelity process plant modeling of an unmanned sailboat with a wing sail based on multi-body dynamics.&quot; <i>IFAC-PapersOnLine</i>.'
---
无人帆船动力学具有显著非线性，翼帆、舵、龙骨与船体在风、浪、流激励下存在强耦合。面向实时控制的控制对象模型通常采用线性化或解耦近似，难以充分刻画流动分离、船体振荡及跨子系统耦合效应；而用于设计验证与数字孪生的高保真过程对象模型在无人帆船领域仍相对不足。

针对这一差距，本文构建了面向翼帆无人帆船的 MATLAB/Simulink 高保真过程对象模型（据作者所知属该方向的首次系统实现）。模型在六自由度多体动力学框架中计入帆–舵–龙骨–船体耦合；船体波浪响应由 WAMIT 频域势流系数驱动；翼面、舵与龙骨载荷统一采用 Morison 方程描述，升阻力系数取自预计算 CFD 系数图，并通过离散面元方法分配分布力。模块化实现支持刚体动力学与环境力之间的双向耦合。静力试验与波浪激励下的动态响应分析验证了模型的物理一致性，可为复杂海况下的设计优化、控制器验证与故障场景测试提供可复用的仿真基础。

The dynamics of unmanned sailboats are strongly nonlinear, with the wing sail, rudder, keel, and hull tightly coupled under wind, wave, and current excitation. Control plant models intended for real-time implementation are typically linearised or decoupled, and therefore may not adequately represent flow separation, hull oscillation, or cross-subsystem coupling. High-fidelity process plant models, which are valuable for design validation and digital-twin development, remain comparatively underexplored for unmanned sailboats.

To address this gap, this paper develops a MATLAB/Simulink high-fidelity process plant model for a wing-sailed unmanned sailboat which, to the best of the authors’ knowledge, constitutes a first systematic realisation of this kind. The six-degree-of-freedom multi-body formulation accounts for sail–rudder–keel–hull coupling; hull wave responses are driven by WAMIT frequency-domain potential-flow coefficients; and loads on the foils are described uniformly by the Morison equation, with lift and drag coefficients taken from precomputed CFD maps and distributed through a discretised panel method. The modular implementation supports bidirectional coupling between rigid-body dynamics and environmental forces. Static force characterisation and dynamic response analysis under wave excitation confirm physical consistency, providing a reusable simulation basis for design optimisation, controller validation, and failure-scenario testing under complex sea conditions.

<small>[View on Publisher Site (DOI)](https://doi.org/10.1016/j.ifacol.2025.11.687)</small>
