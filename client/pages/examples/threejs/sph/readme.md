# Smoothed-Particle Hydrodynamics

## Table of Contents

## Overview

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.css" integrity="sha384-BdGj8xC2eZkQaxoQ8nSLefg4AV4/AwB3Fj+8SUSo7pnKP6Eoy18liIKTPn9oBYNG" crossOrigin="anonymous"/>

## Example

<SPH/>

## Solid Mechanics

Solid mechanics
Libersky and Petschek[25][26] extended SPH to Solid Mechanics. The main advantage of SPH in this application is the possibility of dealing with larger local distortion than grid-based methods. This feature has been exploited in many applications in Solid Mechanics: metal forming, impact, crack growth, fracture, fragmentation, etc.

Another important advantage of meshfree methods in general, and of SPH in particular, is that mesh dependence problems are naturally avoided given the meshfree nature of the method. In particular, mesh alignment is related to problems involving cracks and it is avoided in SPH due to the isotropic support of the kernel functions. However, classical SPH formulations suffer from tensile instabilities[27] and lack of consistency.[28] Over the past years, different corrections have been introduced to improve the accuracy of the SPH solution, leading to the RKPM by Liu et al.[29] Randles and Libersky[30] and Johnson and Beissel[31] tried to solve the consistency problem in their study of impact phenomena.

Dyka et al.[32][33] and Randles and Libersky[34] introduced the stress-point integration into SPH and Ted Belytschko et al.[35] showed that the stress-point technique removes the instability due to spurious singular modes, while tensile instabilities can be avoided by using a Lagrangian kernel. Many other recent studies can be found in the literature devoted to improve the convergence of the SPH method.

Recent improvements in understanding the convergence and stability of SPH have allowed for more widespread applications in Solid Mechanics. Other examples of applications and developments of the method include:

Metal forming simulations.[36]
SPH-based method SPAM (Smoothed Particle Applied Mechanics) for impact fracture in solids by William G. Hoover.[37]
Modified SPH (SPH/MLSPH) for fracture and fragmentation.[38]
Taylor-SPH (TSPH) for shock wave propagation in solids.[39]
Generalized coordinate SPH (GSPH) allocates particles inhomogeneously in the Cartesian coordinate system and arranges them via mapping in a generalized coordinate system in which the particles are aligned at a uniform spacing.[40]

## Numerical Methods

$$
\frac{dr_i}{dt} = v_i
$$

$$
A(r) = \int A(r') W(\left\lvert{r - r'}\right\rvert, h) dV (r')
$$

## Pics

Text

<img className="ui small image" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/SPHBoundaryConvolutionSplit.svg/330px-SPHBoundaryConvolutionSplit.svg.png"/>

More text
